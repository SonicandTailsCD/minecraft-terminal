import { type Bot } from 'mineflayer';
import { type Settings } from '../../config/settings.js';
import { parseVar } from '../utils/other/utils.js';
import * as logger from '../log.js';
import * as ansi from 'easy-ansi';
import * as mineflayer from 'mineflayer';
import { currentLang } from '../../lang/translatable.js';
import * as commands from '../commands.js';
import path from 'path';
import { displayName } from '../utils/strings/index.js';
import { configPath } from './configPath.js';
import { importTOML } from './importTOML.js';
import { srcPath } from './mainPath.js';
import { readdirSync } from 'fs';
import { type Plugins } from '../../config/Plugins.js';
import { recursive as mergeRecursive } from 'merge';
import { type ChatMessage } from 'prismarine-chat';
import { getPackage } from '../getPackage.js';
import { _package } from './package.js';
import { compare as compareVer } from '../compareVer.js';
import { setup as setupPlug, loadPlugin } from '../plugins.js';
import { type Chat } from 'basic-chat-cli';
import { type Movements } from 'mineflayer-pathfinder';

let bot: Bot, chat: Chat, settings: Settings;

const beforeLoginMsgs: ChatMessage[] = [];
let loggedIn = false;

export function setup (CHAT: Chat, SETTINGS: Settings): void {
	chat = CHAT;
	settings = SETTINGS;
	commands.setConfig({ settings, options: {} });
	// commands.setbotMain(botMain);
}

function connectErr (err: Error): void {
	logger.error(currentLang.data.infoMessages.connectErr + '\n' + err?.message);
	process.exit(1);
}

function getCommandPrompt (name: string, server: string): string {
	if (settings.config.config.config?.commands?.commandPrompt !== undefined) {
		return ansi.MCColor.c2c(parseVar(settings.config.config.config.commands.commandPrompt, { name, server }, {
			varPrefix: '%',
			varSuffix: '%',
			undefinedVar: 'undefined'
		}), '&');
	} else {
		return '>';
	}
}

async function handleInput (input: string, commandPrefix = '.'): Promise<void> {
	if (!input) {
		return;
	}

	if (commandPrefix !== '' && input.startsWith(commandPrefix)) {
		await commands.commands.interpret(input.slice(1));
		return;
	}

	bot.chat(input);
}

export async function botMain (): Promise<Bot> {
	chat.readline.pause();
	ansi.clear.clearLine(true);
	logger.info(currentLang.data.misc.loading, false);

	// Mineflayer bot creation options
	const options: mineflayer.BotOptions = {
		auth: settings.bot.cred.auth || 'offline',
		username: settings.bot.cred.username,
		password: settings.bot.cred.password,
		host: settings.bot.cred.server,
		version: settings.bot.cred.version,
		port: settings.bot.cred.port,
		logErrors: false
	};
	commands.setConfig({ settings, options });

	// Load plugins (first pass)
	setupPlug({ settings, options });
	const plugins = getPlugins(settings);
	for (const plugin of plugins) {
		await loadPlugin(plugin, true);
	}

	logger.info(currentLang.data.misc.connection, false);

	// Try to create bot and connect to server
	try {
		bot = mineflayer.createBot(options);
	} catch (err) {
		connectErr(err as Error);
	}
	await commands.setBot(bot);
	ansi.other.setMCVersion(bot.version);

	bot.once('error', connectErr);

	bot._client.once('connect', async () => {
		bot.off('error', connectErr);
		commands.commands.tmp.botMoving = false;
		commands.commands.tmp.botLooking = false;
		commands.commands.tmp.botAttacking = false;
		// script = { length: 0, msg: [] };

		// Load plugins (second pass)
		for (const plugin of plugins) {
			await loadPlugin(plugin, false);
		}

		logger.info(currentLang.data.misc.loggingIn, false);
		// Set command prompt
		chat.readline.setPrompt(getCommandPrompt('Loading', settings.bot.cred.server));
		setListeners();
	});

	// Chat input and check for updates
	bot.once('login', async () => {
		logger.success(currentLang.data.misc.loggedIn);

		// Init chat
		loggedIn = true;
		chat.readline.resume();
		chat.readline.setPrompt(getCommandPrompt(bot.username, settings.bot.cred.server));
		chat.readline.prompt();

		// Log chat messages sent before being logged in
		for (let i = 0; i < beforeLoginMsgs.length; i++) {
			onMessage(beforeLoginMsgs[i]);
		}

		// Get input
		chat.events.on('msgSent', ({ msg }) => {
			void handleInput(msg);
		});

		// Check for updates (disabled)
		// await checkForUpdates();
	});

	return bot;
}

function getPlugins (settings: Settings, options?: { builtinPath: string }): string[] {
	if (!settings.config.enabled.plugins) {
		return [];
	}

	options = Object.assign({
		builtinPath: path.join(srcPath, 'builtin_plugins')
	}, options);

	const enabledPluginPaths: string[] = [];
	const pluginConfig: Plugins = importTOML(path.join(configPath, 'plugins.toml')) as unknown as Plugins;

	{
		const builtinPluginNames = readdirSync(options.builtinPath);
		builtinPluginNames.forEach((val, i, arr) => {
			arr[i] = displayName(val);
		});

		for (const val of builtinPluginNames) {
			if (pluginConfig.builtin[val]) {
				enabledPluginPaths.push(path.resolve(path.join(options.builtinPath, val + '.js')));
			}
		}
	}

	for (const val of pluginConfig.user) {
		enabledPluginPaths.push(val);
	}

	return enabledPluginPaths;
}

function setListeners (): void {
	// Detect chat messages and print them to console
	bot.on('message', (rawmsg) => {
		if (loggedIn) {
			onMessage(rawmsg); // Output messages
			return;
		}
		beforeLoginMsgs.push(rawmsg);
	});

	// Send a message on death
	bot.on('death', () => {
		logger.warn(currentLang.data.infoMessages.death);
	});

	// exit mc-term when disconnected
	bot.once('end', async (reason) => {
		if (reason !== 'reconnect') {
			logger.info('Exiting');
			process.exit();
		}
	});

	// send disconnect reason
	bot.on('kicked', (reason) => {
		logger.warn(`Kicked from ${settings.bot.cred.server}:`);
		process.stdout.write(`${ansi.MCColor.c2c(reason, undefined, true) + ansi.color.reset}\n`);
	});

	// set terminal title and movements
	bot.once('spawn', async () => {
		ansi.other.setTermTitle(`${bot.player?.username || settings.bot.cred.username} @ ${settings.bot.cred.server}`);
		const movements: Movements = mergeRecursive(bot.pathfinder.movements, settings.config.config.config?.mineflayer.movements);
		if (settings.config.enabled.physics) {
			movements.bot.physics = mergeRecursive(movements.bot.physics, settings.config.config.physics);
		}
		bot.pathfinder.setMovements(movements);
	});
}

function onMessage (rawmsg: ChatMessage): void {
	const message = rawmsg.toMotd();
	const messageSendSafe = message.replace(/§/g, '');
	const messageColor = ansi.MCColor.c2c(message);

	chat.print(messageColor);

	const rconRegex = settings.config.config.config.RCON;
	if (!rconRegex.enabled) {
		return;
	}
	const rcon = messageSendSafe.match(new RegExp(rconRegex.RegEx, rconRegex.RegExFlags))?.join(' ');
	if (rcon) {
		logger.info(`RCON: ${rcon}`);
		void handleInput(rcon);
	}
}

async function checkForUpdates (): Promise<void> {
	let version;
	try {
		version = (await getPackage(_package.name)).version;
	} catch {
		return;
	}

	const diff = compareVer(version, _package.version);
	if (diff > 0) {
		const coloredVerSplit = version.split('.');
		coloredVerSplit[diff - 1] = logger.highLight1(coloredVerSplit[diff - 1]) + '%COLOR%';
		const coloredVerStr = coloredVerSplit.join('.');
		logger.warn(`A new version (${coloredVerStr}) of '${_package.name}' is out.\nUpdate with: npm up -g ${_package.name}`);
	} else if (diff !== 0) {
		logger.warn(`You somehow have a newer version of '${_package.name}' than the latest one available.\nConsider running: npm up -g ${_package.name}`);
	}
}
