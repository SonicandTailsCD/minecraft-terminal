// @ts-nocheck

import { parseStr, parseVar, matchEq, toLowerCaseArr } from './utils/other/utils.js';
import { type Bot, type BotEvents, type BotOptions } from 'mineflayer';
import * as mcUtils from './utils/other/mineflayer-utils.js';
import { parseCoords } from './utils/strings/parseCoords.js';
import { goals, pathfinder } from 'mineflayer-pathfinder';
import { accessSync, readFileSync, constants } from 'fs';
import { currentLang } from '../lang/translatable.js';
import { distance, isNumber } from './utils/numbers/index.js';
import { getQuotedStrings, isString } from './utils/strings/index.js';
import { tab } from './utils/strings/tabulate.js';
import { Settings } from '../config/settings.js';
import { type Window } from 'prismarine-windows';
import { _package } from './helpers/package.js';
import makeRegistry from 'prismarine-registry';
import type TypedEmitter from 'typed-emitter';
import { type Task } from '../types/Task.js';
import { TaskQueue } from './utils/other/taskQueue.js';
import makePrismChat from 'prismarine-chat';
import { type Item } from 'prismarine-item';
import { EventEmitter } from 'node:events';
import { sleep } from './helpers/sleep.js';
import { v, Vec3 } from './vec3.js';
import * as logger from './log.js';
import * as ansi from 'easy-ansi';
import { pointsInBetween } from './utils/other/pointsInBetween.js';
import { type Block } from 'prismarine-block';

let pRegistry = makeRegistry('1.12.2');
let ChatMessage = makePrismChat(pRegistry);

interface CommandEvents {
	msg: (msg: string, resetCursor: boolean) => void | Promise<void>
	msg_info: (msg: string, resetCursor: boolean) => void | Promise<void>
	msg_warn: (msg: string, resetCursor: boolean) => void | Promise<void>
	msg_error: (msg: string, resetCursor: boolean, err: Error) => void | Promise<void>
	msg_success: (msg: string, resetCursor: boolean) => void | Promise<void>
}

export const events: TypedEmitter<CommandEvents> = new EventEmitter();

export function print (msg: string, resetCursor = true): void {
	events.emit('msg', msg, resetCursor);
}

export function info (msg: string, resetCursor = true): void {
	events.emit('msg_info', msg, resetCursor);
}

export function warn (msg: string, resetCursor = true): void {
	events.emit('msg_warn', msg, resetCursor);
}

export function error (msg: string, resetCursor = true, err?: Error): void {
	events.emit('msg_error', msg, resetCursor, err);
}

export function success (msg: string, resetCursor = true): void {
	events.emit('msg_success', msg, resetCursor);
}

let settings: { settings: Settings, options: Partial<BotOptions> } = {
	settings: new Settings(),
	options: {}
};

export function setConfig (conf: { settings: Settings, options: Partial<BotOptions> }): void {
	settings = conf;
}

const botLookPriorityCache = {
	priority: 0,
	cooldown: 0
};

export const reservedCommandNames = [
	'interpret',
	'cmd',
	'tmp',
	'tasks'
];

export const scriptOnlyCommands = [
	'wait',
	'async',
	'print',
	'success',
	'info',
	'warn',
	'error'
];

export const nonVanillaCommands = [
	'smartfollow',
	'unfollow',
	'pathfind',
	'attack',
	'stopattack'
];

type Command = Record<string, (...args: unknown[]) => Promise<unknown> | unknown>;

type Variables = Record<string, unknown>;

interface Tmp {
	variables: Variables
	botMoving: boolean
	botLooking: boolean
	botAttacking: boolean
	botDigging: boolean
}

class Commands {
	public readonly tmp: Tmp = {
		variables: {},
		botMoving: false,
		botLooking: false,
		botAttacking: false,
		botDigging: false
	};

	public commands: Command = {};

	public async interpret (str: string, options: { type?: string } = {}): Promise<void> {
		const trimmedStr = str.trim();
		if (!trimmedStr || trimmedStr.startsWith('#')) return;

		const { type } = options;
		const interpretLine = async (line: string): Promise<void> => {
			const [command, ...args] = this.parseInput(line.trim());
			const func = this.getCaseInsens(this.convertAlias(command), this.commands);

			if (!func || reservedCommandNames.includes(command)) {
				warn(currentLang.data.infoMessages.invalidCmd(command));
				return;
			}

			if (!settings.settings.config.config.config.commands.enableNonVanillaCMD && nonVanillaCommands.includes(command)) {
				warn(currentLang.data.infoMessages.nonVanillaCmd);
				return;
			}

			if (type !== 'script' && scriptOnlyCommands.includes(command)) {
				warn(currentLang.data.infoMessages.scriptOnlyCmd);
				return;
			}

			await func(...args);
		};

		const lines = trimmedStr.split(/[\n;]{2}/);
		for (const line of lines) {
			await interpretLine(line);
		}
	}

	public async runTasks (tasks: Record<Task['name'], Task['cmd']>): void {
		for (const [name, cmd] of Object.entries(tasks)) {
			const [times, eventName] = name.split('_');
			if (['on', 'once'].includes(times) && typeof cmd === 'string' && cmd !== '' && eventName) {
				bot[times as keyof BotEvents](eventName, async () => {
					await commands.interpret(cmd);
				});
			}
		}
	}

	private parseInput (str: string): [string, ...Array<string | number | boolean | null | undefined>] {
		let out = str.trim();
		out = parseCoords(str, bot.entity.position, 3);
		out = parseVar(out, this.tmp.variables, {
			varPrefix: '%',
			varSuffix: '%',
			undefinedVar: 'undefined'
		});

		let outt = getQuotedStrings(out);
		const t = outt.shift();
		outt = parseStr.parseArr(outt);
		outt.unshift(t);
		return outt as [string, ...Array<string | number | boolean | undefined | null>];
	}

	private getCaseInsens<T> (key: string, obj: Record<unknown, T>): T {
		const aliasKeys = toLowerCaseArr(Object.keys(obj));
		const indexOf = aliasKeys.indexOf(key.toLowerCase());

		if (indexOf !== -1) {
			return Object.values(obj)[indexOf];
		}
	}

	private convertAlias (alias: string): string {
		if (!alias) {
			return;
		}

		const commandAliases = settings.settings.config.config.config.commands.commandAliases;
		return this.getCaseInsens(alias, commandAliases) || alias.toLowerCase();
	}
}

export const commands = new Commands();

export let bot: Bot;
// let botMain;

let botSet = false;
export const setBot = async (Bot: Bot): Promise<void> => {
	if (botSet) {
		return;
	}
	botSet = true;
	bot = Bot;
	mcUtils.setup(bot, botLookPriorityCache);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	pRegistry = makeRegistry(bot.version);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	ChatMessage = makePrismChat(pRegistry);
	bot.loadPlugin(pathfinder);
	// send a message when a window opens
	bot.on('windowOpen', () => {
		info('Container #1 opened\nUse ".inventory 1" to interact with it');
	});
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setbotMain = async (_botmain: () => Promise<Bot>): Promise<void> => {
// botMain = botmain;
};

export class PluginExportsBefore {
	public settings = settings;
	public ansi = ansi;
	public print = print;
	public info = info;
	public warn = warn;
	public error = error;
	public success = success;
}

export class PluginExports {
	public sleep = sleep;
	public commands = commands;
	public pRegistry = pRegistry;
	public reservedCommandNames = reservedCommandNames;
	public settings = settings;
	public nonVanillaCommands = nonVanillaCommands;
	public Vec3 = Vec3;
	public mcUtils = mcUtils;
	public parseCoords = parseCoords;
	public parseStr = parseStr;
	public distance = distance;
	public bot = bot;
	public ansi = ansi;
	public print = print;
	public info = info;
	public warn = warn;
	public error = error;
	public success = success;
	public currentLang = currentLang;
}

commands.commands.exit = () => {
	bot.quit();
	return true;
};

// Fix this
commands.commands.reco = async () => {
// info('Reconnecting');
// chat.removeAllListeners();
// chat.pause();
// bot.quit('reconnect');
// await sleep(100);
// // bot.removeAllListeners();
// botMain();
	warn('Use .exit instead');
	return false;
};

function getCmdInfo (cmd: string, info = 'usage'): string {
	const cmdArr = cmd.split('.');

	let langCmd = currentLang.data.commands[cmdArr[0]];

	for (let i = 1; i < cmdArr.length && langCmd; i++) {
		langCmd = langCmd.subCommands?.[cmdArr[i]];
	}

	return langCmd?.[info] ?? '';
}

commands.commands.send = (...msg) => {
	const out = msg.join(' ');

	if (!out) {
		info(getCmdInfo('send'));
		return;
	}

	bot.chat(out);
};

commands.commands.position = () => {
	const pos = bot.entity.position;
	info(`Position: ${Number(pos.x.toFixed(3))}, ${Number(pos.y.toFixed(3))}, ${Number(pos.z.toFixed(3))}`);
};

commands.commands.distance = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
	if (!isNumber(x1) || !isNumber(y1) || !isNumber(z1) || !isNumber(x2) || !isNumber(y2) || !isNumber(z2)) {
		info(getCmdInfo('distance'));
		return;
	}

	const point1 = v(x1, y1, z1);
	const point2 = v(x2, y2, z2); // call v() with the correct arguments
	info(`Distance: ${Number(distance(point1, point2).toFixed(3))}`);
};

commands.commands.list = () => {
	let out = '';
	for (const player in bot.players) {
		if (Object.hasOwnProperty.call(bot.players, player)) {
			const playerInfo = bot.players[player];
			out = `${out} ${playerInfo.username} [${playerInfo.ping}]`;
		}
	}
	info(`Player list:${out}`);
};

commands.commands.blocks = async (range, count, filter) => {
	if ((!isNumber(range) || range <= 0) || (!isNumber(count) && count !== undefined)) {
		info(getCmdInfo('blocks'));
		return;
	}

	const blocksCoords = bot.findBlocks({
		matching: (block) => {
			if (block.type !== pRegistry.blocksByName.air.id) {
				return true;
			}
			return false;
		},
		maxDistance: range,
		count: count ?? Infinity
	});

	let blockCount = 0;
	const regex = new RegExp(filter, 'i');
	for (const blockPos of blocksCoords) {
		const block = bot.blockAt(blockPos);
		if ((block == null) || ((block.displayName?.match(regex)) == null)) {
			continue;
		}
		print(`       ${logger.info.color}${block.position.x}, ${block.position.y} ${block.position.z}  ${block.displayName}: ${String(block.diggable)}${ansi.color.reset}`);
		blockCount++;
	}
	info('Count: ' + String(blockCount));
};

async function botDig (pos: Vec3, forceLook: boolean | 'ignore', type: 'auto' | 'raycast' | Vec3, silent = true): Promise<boolean> {
	if (commands.tmp.botDigging || commands.tmp.botLooking || commands.tmp.botAttacking) {
		return;
	}

	const block = bot.blockAt(pos);
	if (block === null || !block.diggable) {
		if (!silent) warn('Block is undiggable');
		return false;
	}

	try {
		await bot.dig(block, forceLook, type);
	} catch (err) {
		if (!silent) warn(currentLang.data.infoMessages.cantDigBlockAt(pos.x, pos.y, pos.z, err));
		return false;
	}

	return true;
}

commands.commands.dig = async (x: number, y: number, z: number) => {
	if (!isNumber(x) || !isNumber(y) || !isNumber(z)) {
		info(getCmdInfo('dig'));
		return;
	}
	if (commands.tmp.botDigging || commands.tmp.botLooking || commands.tmp.botAttacking) {
		warn(currentLang.data.infoMessages.botLookingOrAttackingErr);
		return true;
	}

	const botDigPromise = botDig(v(x, y, z), true, 'raycast');
	commands.tmp.botLooking = true;
	commands.tmp.botDigging = true;
	if (await botDigPromise) {
		success(`Dug block at ${x}, ${y}, ${z}`);
	}
	commands.tmp.botLooking = false;
	commands.tmp.botDigging = false;
};

commands.commands.stopDig = () => {
	bot.stopDigging();
	success('Stopped digging');
};

const digQueue = new TaskQueue();
const digMapAddedCoordinates: string[] = [];

commands.commands.digMap = async (subCmd: 'add' | 'remove' | 'clear' | 'addspace' | 'show', ...args) => {
	if (!['add', 'remove', 'clear', 'addspace', 'show'].includes(subCmd?.toLowerCase())) {
		info(getCmdInfo('digMap'));
		return;
	}

	const subCommands = {
		add (x: number, y: number, z: number): void {
			if (!isNumber(x) || !isNumber(y) || !isNumber(z)) {
				info(getCmdInfo('digMap.add'));
				return;
			}

			const coords = `${x}, ${y}, ${z}`;

			if (digMapAddedCoordinates.includes(coords)) {
				return;
			}

			commands.commands.digMap.onBlockUpdate(undefined, bot.blockAt(v(x, y, z)));
			bot.on(`blockUpdate:(${coords})`, commands.commands.digMap.onBlockUpdate);
			digMapAddedCoordinates.push(coords);
		},

		remove (x: number, y: number, z: number): void {
			if (!isNumber(x) || !isNumber(y) || !isNumber(z)) {
				info(getCmdInfo('digMap.remove'));
				return;
			}

			const coords = `${x}, ${y}, ${z}`;
			const index = digMapAddedCoordinates.indexOf(coords);

			if (index === -1) {
				return;
			}

			bot.off(`blockUpdate:(${coords})`, commands.commands.digMap.onBlockUpdate);

			digMapAddedCoordinates.splice(index, 1);
		},

		clear (): void {
			while (digMapAddedCoordinates.length !== 0) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const coords = digMapAddedCoordinates.shift()!;

				bot.off(`blockUpdate:(${coords})`, commands.commands.digMap.onBlockUpdate);
			}
		},

		addspace (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): void {
			if (!isNumber(x1) || !isNumber(y1) || !isNumber(z1) || !isNumber(x2) || !isNumber(y2) || !isNumber(z2)) {
				info(getCmdInfo('digMap.addspace'));
				return;
			}

			const points = pointsInBetween(v(x1, y1, z1), v(x2, y2, z2));
			for (const vec of points) {
				this.add(vec.x, vec.y, vec.z);
			}
		},

		show () {
			info('Added blocks:\n' + digMapAddedCoordinates.join('\n'));
		}
	};

	await subCommands[subCmd.toLowerCase()](...args);
};

commands.commands.digMap.onBlockUpdate = (oldBlock: unknown, newBlock: Block): void => {
	if (!newBlock.diggable) {
		return;
	}

	const addTask = (currentDepth: number): void => {
		if (commands.tmp.botDigging || commands.tmp.botLooking || commands.tmp.botAttacking) {
			return;
		}

		void digQueue.add(async () => {
			const digSuccess = await botDig(newBlock.position, true, 'raycast', true);

			if (!digSuccess) {
				if (currentDepth >= 3) {
					if (currentDepth < 8) {
						await sleep(250);
					} else if (currentDepth < 15) {
						await sleep(600);
					} else {
						return;
					}
				}

				addTask(currentDepth + 1);
			}
		});
	};

	addTask(0);
};

commands.commands.place = async (x, y, z) => {
	if (commands.tmp.botLooking || commands.tmp.botAttacking) {
		warn(currentLang.data.infoMessages.botLookingOrAttackingErr);
		return true;
	}

	if (!isNumber(x) || !isNumber(y) || !isNumber(z)) {
		info(getCmdInfo('place'));
		return;
	}

	commands.tmp.botLooking = true;

	try {
		const position = v(x, y, z);
		await mcUtils.placeBlock(position);
	} catch (e) {
		const err: Error = e;
		switch (err.message) {
			case 'x, y and z must be numbers':
				info(getCmdInfo('place'));
				break;

			case 'Block is not empty':
				warn(currentLang.data.infoMessages.alreadyBlockThere);
				break;

			case 'There are no valid blocks next to there':
				warn(currentLang.data.infoMessages.blockPlaceAdjErr);
				break;

			case 'Impossible to place block from this angle':
				warn(err.message);
				break;

			default:
				error(`Could not place block.\n${err.message}`, true, err);
				break;
		}
		return;
	} finally {
		commands.tmp.botLooking = false;
	}
	success('Successfully placed block');
};

commands.commands.moveTo = async (X: number, Z: number, mustBeUndefined: undefined) => {
	if (!isNumber(X) || !isNumber(Z) || mustBeUndefined !== undefined) {
		info(getCmdInfo('moveTo'));
		return;
	}

	info(`Attempting to move to ${X}, ${Z}`);
	try {
		await mcUtils.moveXZ(X, Z);
	} catch (err) {
		error('Bot got stuck and couldn\'t reach its destination', true, err);
		return;
	}

	success(`Moved to ${X}, ${Z}`);
};

commands.commands.move = async (direction: string, distance: number) => {
// ?
	if (!direction || (distance !== undefined && distance <= 0)) {
		info(getCmdInfo('move'));
		return;
	}
	if (commands.tmp.botMoving) {
		warn(currentLang.data.infoMessages.botMovingErr);
		return;
	}
	distance = distance || 1;
	let x = 0;
	let z = 0;
	switch (direction) {
		case 'north': z = -distance;
			break;
		case 'south': z = distance;
			break;
		case 'east': x = distance;
			break;
		case 'west': x = -distance;
			break;
		default:
			info('Usage: .move <Direction:north|south|east|west> <distance?>. Distance > 0');
			return;
	}
	if (!Number.isInteger(distance)) {
		warn('Distance must be an integer');
		return;
	}
	commands.tmp.botMoving = true;
	let unit;
	if (distance === 1) unit = 'block';
	else unit = 'blocks';

	info(`Attempting to move ${direction} for ${distance} ${unit}`);
	const position = bot.entity?.position;
	// await bot.pathfinder.goto(new goals.GoalXZ(position.x + x, position.z + z)).catch((err) => {
	// error(`Cannot move ${direction} for ${distance} ${unit}.\n${err}`);
	// });
	try {
		await mcUtils.moveXZ(position.x + x, position.z + z, 0, Infinity);
	} catch (e) {
		const err: Error = e;
		warn(`${err.message}.\nStopped moving`);
		return;
	} finally {
		commands.tmp.botMoving = false;
	}
	success(`Moved ${direction} for ${distance} ${unit}`);
};

async function botFollow (matchesStr, range): Promise<void> {
	if (commands.tmp.botMoving) {
		return;
	}

	// Save the initial used control states
	const sprintState = bot.getControlState('sprint');
	const jumpState = bot.getControlState('jump');

	commands.tmp.botMoving = true;
	while (commands.tmp.botMoving) {
		await sleep(150);
		const entity = bot.nearestEntity((entity) => {
			try {
				return matchEq(matchesStr, entity);
			} catch {
				if (!err) err = true;
			}
		});

		if (!entity) {
			continue;
		}

		await mcUtils.followEntityWithJump(entity, range);
	}

	// Reset to initial states
	bot.setControlState('sprint', sprintState);
	bot.setControlState('jump', jumpState);
}

commands.commands.follow = async (matchesStr: string, range: number) => {
	if (commands.tmp.botMoving) {
		warn(currentLang.data.infoMessages.botMovingErr);
		return;
	}

	if (!['string', 'boolean'].includes(typeof matchesStr) || !isNumber(range) || range <= 0) {
		info(getCmdInfo('follow'));
		return;
	}

	try {
		matchEq(matchesStr, {});
	} catch {
		info(getCmdInfo('follow'));
		return;
	}
	let unit;
	if (range === 1) unit = 'block';
	else unit = 'blocks';
	success(`Following nearest entity if ${matchesStr} with a range of ${range} ${unit}`);
	void botFollow(matchesStr, range);
	commands.tmp.botMoving = true;
};

commands.commands.pathfind = async (X: number, ZOrY: number, Z?: number) => {
	if (!isNumber(X) || !isNumber(ZOrY) || (!isNumber(Z) && Z !== undefined)) {
		info(getCmdInfo('pathfind'));
		return;
	}

	if (commands.tmp.botMoving) {
		warn(currentLang.data.infoMessages.botMovingErr);
		return;
	}

	let goal: goals.Goal;
	let ZAndYStr: string;
	if (Z) {
		goal = new goals.GoalBlock(X, ZOrY, Z);
		ZAndYStr = `${ZOrY}, ${Z}`;
	} else {
		goal = new goals.GoalXZ(X, ZOrY);
		ZAndYStr = String(ZOrY);
	}

	commands.tmp.botMoving = true;
	info(`Attempting to move to ${X}, ${ZAndYStr}`);
	await bot.pathfinder.goto(goal)
		.catch((e) => {
			const err: Error = e;
			error(`Could not move to ${X}, ${ZAndYStr}.\n${err.message}`, true, err);
			commands.tmp.botMoving = false;
		});
	success(`Moved to ${X}, ${ZAndYStr}`);
	commands.tmp.botMoving = false;
};

commands.commands.forceMove = async (direction: 'up' | 'forward' | 'back' | 'left' | 'right' | 'sprint', time: number) => {
	if ((direction === 'up' || direction === 'forward' || direction === 'back' || direction === 'left' || direction === 'right' || direction === 'sprint') && isNumber(time)) {
		info(`Moving ${direction} for ${time} seconds`);
		if (direction === 'up') direction = 'jump';
		bot.setControlState(direction, true);
		await sleep(time * 1000);
		bot.setControlState(direction, false);
		success(`Moved ${direction} for ${time} seconds`);
	} else info(getCmdInfo('forceMove'));
};

/**
* The commands.commands.control function sets the control state of the bot.
*
* @param control Used to Set the control state of a specific control.
* @param state Used to Determine whether the control is set to true or false.
* @return Nothing.
*
*/
commands.commands.control = (control: 'up' | 'forward' | 'back' | 'left' | 'right' | 'sprint' | 'sneak', state: boolean) => {
	if (['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].includes(control) && typeof state === 'boolean') {
		bot.setControlState(control, state);
		success(`Set control state ${control} to ${String(state)}`);
		return;
	}

	if (control === 'clearall') {
		bot.clearControlStates();
		success('Cleared all control states');
		return;
	}

	info(getCmdInfo('control'));
};

async function botSmartFollow (matchesStr, range): Promise<void> {
	if (!matchesStr || !range) {
		return;
	}

	matchEq(matchesStr, {});

	while (commands.tmp.botMoving) {
		const entity = bot.nearestEntity((entity) => {
			try {
				return entity ? matchEq(matchesStr, entity) : false;
			} catch {}
		});
		if (((entity?.position) == null) || !bot.entity?.position) {
			await sleep(150);
			continue;
		}
		const dist = distance(bot.entity.position, entity.position) - 0.67;
		if (dist < range) {
			await sleep(150);
			continue;
		}
		const goal = new goals.GoalFollow(entity, range);
		try {
			await bot.pathfinder.goto(goal, () => { console.log('dddd') });
		} catch {
			await sleep(1400);
		}
	}
}

commands.commands.smartFollow = async (matchesStr: string, range: number) => {
	if (commands.tmp.botMoving) {
		warn(currentLang.data.infoMessages.botMovingErr);
		return;
	}
	if (!['string', 'boolean'].includes(typeof matchesStr) || !isNumber(range) || range <= 0) {
		info(getCmdInfo('smartFollow'));
		return;
	}

	try {
		matchEq(matchesStr, {});
	} catch {
		info(getCmdInfo('smartFollow'));
		return;
	}
	let unit: string;
	if (range === 1) unit = 'block';
	else unit = 'blocks';
	success(`Following nearest entity if ${matchesStr} with a range of ${range} ${unit}`);
	commands.tmp.botMoving = true;
	void botSmartFollow(matchesStr, range);
};

/**
* The botUnfollow function unfollows the player that is currently being followed.
*
* @return Nothing.
*
*/
function botUnfollow (): void {
	commands.tmp.botMoving = false;
}

commands.commands.unFollow = () => {
	botUnfollow();
	success('Not following anyone');
};

commands.commands.attack = (matchesStr: string, cps: number, reach: number, minreach: number, force = true) => {
	if (commands.tmp.botAttacking) {
		warn('Player is already attacking someone. Use ".stopattack"');
		return;
	}
	if (commands.tmp.botLooking) {
		warn('Player is looking at someone. Use ".stoplook"');
		return;
	}
	const usage = getCmdInfo('attack');
	if (!['string', 'boolean'].includes(typeof matchesStr) || !isNumber(cps) || !isNumber(reach) || !isNumber(minreach) || cps <= 0 || reach <= 0 || reach < minreach) {
		info(usage);
		return;
	}

	try {
		matchEq(matchesStr, {});
	} catch {
		info(usage);
		return;
	}

	commands.tmp.botLooking = true;
	commands.tmp.botAttacking = true;
	success(`Attacking nearest entity with ${cps}CPS if ${matchesStr} and MinReach(${minreach}) < distance < MaxReach(${reach})`);

	const yaw = bot.entity.yaw;
	const pitch = bot.entity.pitch;
	void (
		async () => {
			while (commands.tmp.botAttacking) {
				await sleep(1000 / cps);
				let err = false;
				await mcUtils.botAttack(
					minreach,
					reach,
					bot.nearestEntity((entity) => {
						try {
							if (matchEq(matchesStr, entity) && (entity.type === 'player' || entity.type === 'mob')) {
								return true;
							}
						} catch {
							if (!err) err = true;
						}
					}),
					force
				);
				if (err) {
					commands.tmp.botAttacking = false;
					commands.tmp.botLooking = false;
					error('Invalid EntityMatches');
				}
			}
			await bot.look(yaw, pitch, true);
		}
	)();
};

commands.commands.stopAttack = () => {
	if (commands.tmp.botLooking && !commands.tmp.botAttacking) {
		warn('Cannot use ".stopattack" because player is looking at someone\nConsider ".stoplook"');
		return;
	}
	commands.tmp.botAttacking = false;
	commands.tmp.botLooking = false;
	success('Not attacking anyone');
};

commands.commands.look = async (directionOrYaw: string | number, pitchOrForce?: number | boolean, force?: boolean) => {
	const isDirection = isString(directionOrYaw) && Object.keys(mcUtils.directionToYaw).includes(directionOrYaw);
	const yaw = isDirection ? mcUtils.directionToYaw[directionOrYaw] as number | undefined : directionOrYaw;
	const pitch = isDirection ? undefined : pitchOrForce as number;
	force = isDirection ? pitchOrForce as (boolean | undefined) : force;

	if (!(isNumber(yaw) || yaw === undefined) || !(isNumber(pitch) || pitch === undefined) || (yaw === undefined && pitch === undefined)) {
		info(currentLang.data.commands.look.usage);
		return;
	}

	await mcUtils.look(yaw, pitch, force);
	success(
		`Set ${yaw !== undefined ? `Yaw to ${yaw}` : ''}` +
		`${yaw !== undefined && pitch !== undefined ? ' and ' : ''}` +
		`${pitch !== undefined ? `Pitch to ${pitch}` : ''}`
	);
};

commands.commands.lookAt = (playerName: string, maxReach: number, minReach: number = maxReach, force: boolean) => {
	if (!playerName || maxReach <= 0 || maxReach <= minReach) {
		info(getCmdInfo('lookAt'));
		return;
	}
	if (commands.tmp.botLooking || commands.tmp.botAttacking) {
		warn(currentLang.data.infoMessages.botLookingOrAttackingErr);
		return true;
	}

	commands.tmp.botLooking = true;
	if (force === 'yes' || force === 'y') {
		force = true;
	} else {
		force = false;
	}

	void (
		async () => {
			while (commands.tmp.botLooking) {
				if (bot.players[playerName]?.entity?.position) {
					const dist = distance(bot.players[playerName]?.entity?.position, bot.entity.position);
					if (dist < maxReach && dist > minReach) {
						await bot.lookAt(v(bot.players[playerName].entity.position.x, bot.players[playerName].entity.position.y + bot.players[playerName].entity.height, bot.players[playerName].entity.position.z), force);
					}
				}
				await sleep(100);
			}
		}
	)();

	let withForce = 'without';
	if (force) {
		withForce = 'with';
	}
	success(`Looking at ${playerName} if MinReach(${minReach}) < distance < MaxReach(${maxReach}) ${withForce} force`);
};

commands.commands.stopLook = () => {
	if (commands.tmp.botAttacking) {
		warn('Cannot use ".stoplook" because player is attacking someone\nConsider ".stopattack"');
		return;
	}
	commands.tmp.botLooking = false;
	info('Not looking at anyone');
};

const parseItemName = (item: Item): string => {
	const name: string = item?.nbt?.value?.display?.value?.Name ??
		item?.displayName ??
		item?.name ??
		'unknown_name (bug)';

	let out = name;
	try {
		out = new ChatMessage(JSON.parse(name)).toMotd();
	} catch {}

	return out?.value ?? out;
};

function renderWindow (window: Window, options?: { a: 1 }): string {
	const inventoryItems = mcUtils.getItems(window);

	const a = (items: Item[]): string => {
		if (items.length < 1) {
			return 'Empty';
		}
		const make = (item: Item, itemName: string, d = ''): void => {
			let a = bot.inventory.inventoryStart;
			if (item.slot > bot.inventory.inventoryEnd) {
				a = -a;
			}

			let hotBarNum = a - (bot.inventory.inventoryEnd - item.slot);
			if (!isNumber(hotBarNum) || hotBarNum < 0) {
				hotBarNum = ' ';
			}
			out = `${out + d + String(hotBarNum)} | #${item.slot}: x${item.count}  ${itemName}`;
		};
		let out = '';
		const itemm = items?.[0];

		const itemNamee = parseItemName(itemm);
		make(itemm, itemNamee);
		for (let i = 1; i < items.length; i++) {
			const item = items[i];
			const itemName = parseItemName(item);
			make(item, itemName, '\n');
		}
		return out;
	};

	info(
		a(inventoryItems) +
		'\n' +
		`\nCrafting result slot: ${window.craftingResultSlot}` +
		`\nInventory start: ${window.inventoryStart}` +
		`\nInventory end: ${window.inventoryEnd}` +
		`\nHotbar start: ${window.hotbarStart}` +
		`\nSelected slot: ${bot.quickBarSlot}`
	);
}

commands.commands.inventory = async (windowID: number | string, subCommand: string, ...args) => {
	if (![0, 1, 'inventory', 'container'].includes(windowID)) {
		info(getCmdInfo('inventory'));
		return;
	}

	const isContainer: boolean = [1, 'container'].includes(windowID);

	if (isContainer && !bot.currentWindow) {
		info(currentLang.data.infoMessages.noContainerOpenRN);
		return;
	}

	const currentWindow = (isContainer && bot.currentWindow) ? bot.currentWindow : bot.inventory;

	const runSubCommand = async (cmd: string, args: unknown[]): Promise<void> => {
		const checkIfSlotIsValid = (slotID: number): boolean => {
			if (typeof slotID !== 'number') {
				return false;
			}

			if (slotID < currentWindow?.inventoryStart || slotID >= currentWindow.inventoryEnd) {
				return false;
			}

			return true;
		};

		const close = (): void => {
			if (!isContainer) {
				warn('There is nothing to close');
				return;
			}
			info(`Closing window #${windowID}`);
			bot.closeWindow(bot.currentWindow);
		};

		const click = async (slotID: number, buttonIDName = 'left', buttonModeName: undefined): Promise<void> => {
			if (checkIfSlotIsValid(slotID) || !isString(buttonIDName)) {
				info(getCmdInfo('inventory.click'));
				return;
			}

			const buttonID = buttonIDName === 'right' ? 1 : 0;
			const buttonMode = 0; // Shift clicking is not supported in mineflayer

			info(`${buttonIDName} clicking slot ${String(slotID)} in window #${windowID}`);

			await bot.clickWindow(slotID, buttonID, buttonMode);
		};

		const swap = async (slot1ID: number, slotDestID: number): Promise<void> => {
			if (!checkIfSlotIsValid(slot1ID) || !checkIfSlotIsValid(slotDestID)) {
				info(getCmdInfo('inventory.swap'));
				return;
			}

			info(`Swapping item at slot ${slot1ID} with item at slot ${slotDestID} in window #${windowID}`);
			await bot.clickWindow(inventoryStartOffset + slot1ID, 0, 0);
			await sleep(20);
			await bot.clickWindow(inventoryStartOffset + slotDestID, 0, 0);
			await sleep(20);
			await bot.clickWindow(inventoryStartOffset + slot1ID, 0, 0);
		};

		const drop = async (slotIDs: number[]): Promise<void> => {
			if (slotIDs.length === 0) {
				info(getCmdInfo('inventory.drop'));
				return;
			}

			for (const slotID of slotIDs) {
				if (!checkIfSlotIsValid(slotID)) {
					info(currentLang.data.commands.inventory?.subCommands?.drop?.usage);
					return;
				}
			}

			info(`Dropping items in slots ${slotIDs.join(', ')} in window #${windowID}`);
			for (const slotID of slotIDs) {
				await bot.clickWindow(inventoryStartOffset + slotID, 0, 0);
				await sleep(10);
				await bot.clickWindow(-999, 0, 0);
			}
		};

		const dropall = async (): Promise<void> => {
			const items = isContainer
				? mcUtils.getItems(bot.currentWindow, bot.inventory.inventoryEnd)
				: bot.inventory.items();

			info(`Dropping all items in window #${windowID}`);
			for (let i = 0; i < items.length; i++) {
				await bot.clickWindow(inventoryStartOffset + items[i].slot, 0, 0);
				await sleep(10);
				await bot.clickWindow(-999, 0, 0);
			}
		};

		const inventoryStartOffset = (!isContainer && bot.currentWindow?.inventoryEnd && bot.inventory?.inventoryEnd)
			? bot.currentWindow.inventoryEnd - bot.inventory.inventoryEnd
			: 0;

		cmd = cmd.toLowerCase();
		args = toLowerCaseArr(args);

		switch (cmd) {
			case 'close':
				close();
				return;

			case 'click':
				await click(...args);
				return;

			case 'swap':
				await swap(...args);
				return;

			case 'drop':
				await drop(args);
				return;

			case 'dropall':
				await dropall();
				return;

			default:
				info(getCmdInfo('inventory'));
		}
	};

	if (subCommand !== undefined) {
		if (typeof subCommand === 'string') {
			await runSubCommand(subCommand, args);
			return;
		}

		info(getCmdInfo('inventory'));
		return;
	}

	renderWindow(currentWindow);
};

commands.commands.open = async (x, y, z) => {
	if (!isNumber(x) || !isNumber(y) || !isNumber(z)) {
		info(getCmdInfo('open'));
		return;
	}
	if (commands.tmp.botLooking || commands.tmp.botAttacking) {
		warn(currentLang.data.infoMessages.botLookingOrAttackingErr);
		return true;
	}
	const blockPos = v(x, y, z);
	const block = bot.blockAt(blockPos);
	info('Attempting to open container');
	await bot.openContainer(block)
		.then(() => {
			success('Opened the container');
		})
		.catch((err) => {
			error(err.message, true, err);
		});
};

commands.commands.changeSlot = (slot: number) => {
	if (isNumber(slot) && slot > -1 && slot < 9) {
		bot.setQuickBarSlot(slot);
		info(`Changed slot to ${slot}`);
	} else info(getCmdInfo('changeSlot'));
};

commands.commands.useItem = async (sec: number) => {
	if (sec > 3) {
		info(`Using an item for ${sec ?? 0.1}s`);
	}
	bot.activateItem();
	await sleep(sec * 1000);
	bot.deactivateItem();
	success(`Used an item for ${sec}s`);
};

commands.commands.set = (key: string, value: unknown) => {
	if (key === undefined) {
		info(getCmdInfo('set'));
		return;
	}
	commands.tmp.variables[key] = value;
	success(`Set %${key}% to ${String(value)}`);
};

commands.commands.unset = (key: string) => {
	if (key === undefined) {
		info(getCmdInfo('unset'));
		return;
	}
	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete commands.tmp.variables[key];
	success(`Deleted %${key}%`);
};

commands.commands.value = (key: string) => {
	if (key === undefined) {
		info(getCmdInfo('value'));
		return;
	}
	info(`${key}: ${String(commands.tmp.variables[key])}`);
};

commands.commands.variables = () => {
	const values = Object.values(commands.tmp.variables);
	const keys = Object.keys(commands.tmp.variables);
	let out = '';
	if (keys[0] !== undefined) out = `${keys[0]}: ${String(values[0])}`;
	for (let i = 1; i < values.length; i++) {
		if (keys[i] === undefined) continue;
		out = `${out}\n${keys[i]}: ${String(values[i])}`;
	}
	info('Values:\n' + out);
};

commands.commands.script = async (pathToSrc) => {
	if (!pathToSrc) {
		info(getCmdInfo('script'));
		return;
	}

	try {
		accessSync(pathToSrc, constants.F_OK);
	} catch (err) {
		info('Unable to access file');
		return;
	}

	const data = readFileSync(pathToSrc, { encoding: 'UTF8' });
	for (const line of data.split(/[\n;]/)) {
		await commands.interpret(line, { type: 'script' });
	}
};

commands.commands.version = () => {
	info(`${_package.name} version: ${_package.version}\nNode version: ${process.version}`);
};

commands.commands.wait = async (sec) => {
	await sleep(sec * 1000);
};

commands.commands.async = async (...input) => {
	if (!input[0]) {
		warn('No command provided');
		return;
	}
	void commands.interpret(input.join(' '), { type: 'script' });
};

commands.commands.print = print;
commands.commands.success = success;
commands.commands.info = info;
commands.commands.warn = warn;
commands.commands.error = error;

/**
* The commands.commands.help function prints a help message to the console.
*
* @return Nothing.
*/
commands.commands.help = () => {
	const getCmdDesc = (cmd: string): string | null | undefined => {
		if (reservedCommandNames.includes(cmd)) {
			return null;
		}
		return getCmdInfo(cmd, 'description');
	};

	let out = '';
	const commandNames = Object.keys(commands.commands);
	for (let a = 0; a < commandNames.length; a++) {
		const command = commandNames[a];
		if (reservedCommandNames.includes(command)) {
			continue;
		}
		let end = '\n';
		if (a === commandNames.length - 2) {
			end = '';
		}
		out += '.' + tab(command, getCmdDesc(command) ?? '', 15) + end;
	}
	info(out);
};
