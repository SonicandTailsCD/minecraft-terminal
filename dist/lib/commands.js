"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginExports = exports.PluginExportsBefore = exports.setbotMain = exports.setBot = exports.bot = exports.commands = exports.nonVanillaCommands = exports.scriptOnlyCommands = exports.reservedCommandNames = exports.setConfig = exports.success = exports.error = exports.warn = exports.info = exports.print = exports.events = void 0;
const tslib_1 = require("tslib");
const debugging_1 = require("./lib/helpers/debugging");
const utils_js_1 = require("./utils/other/utils.js");
const mcUtils = tslib_1.__importStar(require("./utils/other/mineflayer-utils.js"));
const parseCoords_js_1 = require("./utils/strings/parseCoords.js");
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const fs_1 = require("fs");
const translatable_js_1 = require("../lang/translatable.js");
const index_js_1 = require("./utils/numbers/index.js");
const index_js_2 = require("./utils/strings/index.js");
const tabulate_js_1 = require("./utils/strings/tabulate.js");
const settings_js_1 = require("../config/settings.js");
const package_js_1 = require("./helpers/package.js");
const prismarine_registry_1 = tslib_1.__importDefault(require("prismarine-registry"));
const taskQueue_js_1 = require("./utils/other/taskQueue.js");
const prismarine_chat_1 = tslib_1.__importDefault(require("prismarine-chat"));
const node_events_1 = require("node:events");
const sleep_js_1 = require("./helpers/sleep.js");
const vec3_js_1 = require("./vec3.js");
const logger = tslib_1.__importStar(require("./log.js"));
const ansi = tslib_1.__importStar(require("easy-ansi"));
const pointsInBetween_js_1 = require("./utils/other/pointsInBetween.js");
let pRegistry = (0, prismarine_registry_1.default)('1.12.2');
let ChatMessage = (0, prismarine_chat_1.default)(pRegistry);
exports.events = new node_events_1.EventEmitter();
function print(msg, resetCursor = true) {
    exports.events.emit('msg', msg, resetCursor);
}
exports.print = print;
function info(msg, resetCursor = true) {
    exports.events.emit('msg_info', msg, resetCursor);
}
exports.info = info;
function warn(msg, resetCursor = true) {
    exports.events.emit('msg_warn', msg, resetCursor);
}
exports.warn = warn;
function error(msg, resetCursor = true, err) {
    exports.events.emit('msg_error', msg, resetCursor, err);
}
exports.error = error;
function success(msg, resetCursor = true) {
    exports.events.emit('msg_success', msg, resetCursor);
}
exports.success = success;
let settings = {
    settings: new settings_js_1.Settings(),
    options: {}
};
function setConfig(conf) {
    settings = conf;
}
exports.setConfig = setConfig;
const botLookPriorityCache = {
    priority: 0,
    cooldown: 0
};
exports.reservedCommandNames = [
    'interpret',
    'cmd',
    'tmp',
    'tasks'
];
exports.scriptOnlyCommands = [
    'wait',
    'async',
    'print',
    'success',
    'info',
    'warn',
    'error'
];
exports.nonVanillaCommands = [
    'smartfollow',
    'unfollow',
    'pathfind',
    'attack',
    'stopattack'
];
class Commands {
    tmp = {
        variables: {},
        botMoving: false,
        botLooking: false,
        botAttacking: false,
        botDigging: false,
        Debugging: {
            triggered: false
        }
    };
    commands = {};
    async interpret(str, options = {}) {
        const trimmedStr = str.trim();
        if (!trimmedStr || trimmedStr.startsWith('#'))
            return;
        const { type } = options;
        const interpretLine = async (line) => {
            const [command, ...args] = this.parseInput(line.trim());
            const func = this.getCaseInsens(this.convertAlias(command), this.commands);
            if (!func || exports.reservedCommandNames.includes(command)) {
                warn(translatable_js_1.currentLang.data.infoMessages.invalidCmd(command));
                return;
            }
            if (!settings.settings.config.config.config.commands.enableNonVanillaCMD && exports.nonVanillaCommands.includes(command)) {
                warn(translatable_js_1.currentLang.data.infoMessages.nonVanillaCmd);
                return;
            }
            if (type !== 'script' && exports.scriptOnlyCommands.includes(command)) {
                warn(translatable_js_1.currentLang.data.infoMessages.scriptOnlyCmd);
                return;
            }
            await func(...args);
        };
        const lines = trimmedStr.split(/[\n;]{2}/);
        for (const line of lines) {
            await interpretLine(line);
        }
    }
    async runTasks(tasks) {
        for (const [name, cmd] of Object.entries(tasks)) {
            const [times, eventName] = name.split('_');
            if (['on', 'once'].includes(times) && typeof cmd === 'string' && cmd !== '' && eventName) {
                exports.bot[times](eventName, async () => {
                    await exports.commands.interpret(cmd);
                });
            }
        }
    }
    parseInput(str) {
        let out = str.trim();
        out = (0, parseCoords_js_1.parseCoords)(str, exports.bot.entity.position, 3);
        out = (0, utils_js_1.parseVar)(out, this.tmp.variables, {
            varPrefix: '%',
            varSuffix: '%',
            undefinedVar: 'undefined'
        });
        let outt = (0, index_js_2.getQuotedStrings)(out);
        const t = outt.shift();
        outt = utils_js_1.parseStr.parseArr(outt);
        outt.unshift(t);
        return outt;
    }
    getCaseInsens(key, obj) {
        const aliasKeys = (0, utils_js_1.toLowerCaseArr)(Object.keys(obj));
        const indexOf = aliasKeys.indexOf(key.toLowerCase());
        if (indexOf !== -1) {
            return Object.values(obj)[indexOf];
        }
    }
    convertAlias(alias) {
        if (!alias) {
            return;
        }
        const commandAliases = settings.settings.config.config.config.commands.commandAliases;
        return this.getCaseInsens(alias, commandAliases) || alias.toLowerCase();
    }
}
exports.commands = new Commands();
let botSet = false;
const setBot = async (Bot) => {
    if (botSet) {
        return;
    }
    botSet = true;
    exports.bot = Bot;
    mcUtils.setup(exports.bot, botLookPriorityCache);
    pRegistry = (0, prismarine_registry_1.default)(exports.bot.version);
    ChatMessage = (0, prismarine_chat_1.default)(pRegistry);
    exports.bot.loadPlugin(mineflayer_pathfinder_1.pathfinder);
    exports.bot.on('windowOpen', () => {
        info('Container #1 opened\nUse ".inventory 1" to interact with it');
    });
};
exports.setBot = setBot;
const setbotMain = async (_botmain) => {
};
exports.setbotMain = setbotMain;
class PluginExportsBefore {
    settings = settings;
    ansi = ansi;
    print = print;
    info = info;
    warn = warn;
    error = error;
    success = success;
}
exports.PluginExportsBefore = PluginExportsBefore;
class PluginExports {
    sleep = sleep_js_1.sleep;
    commands = exports.commands;
    pRegistry = pRegistry;
    reservedCommandNames = exports.reservedCommandNames;
    settings = settings;
    nonVanillaCommands = exports.nonVanillaCommands;
    Vec3 = vec3_js_1.Vec3;
    mcUtils = mcUtils;
    parseCoords = parseCoords_js_1.parseCoords;
    parseStr = utils_js_1.parseStr;
    distance = index_js_1.distance;
    bot = exports.bot;
    ansi = ansi;
    print = print;
    info = info;
    warn = warn;
    error = error;
    success = success;
    currentLang = translatable_js_1.currentLang;
}
exports.PluginExports = PluginExports;
exports.commands.commands.exit = () => {
    exports.bot.quit();
    return true;
};
exports.commands.commands.reco = async () => {
    warn('Use .exit instead');
    return false;
};
function getCmdInfo(cmd, info = 'usage') {
    const cmdArr = cmd.split('.');
    let langCmd = translatable_js_1.currentLang.data.commands[cmdArr[0]];
    for (let i = 1; i < cmdArr.length && langCmd; i++) {
        langCmd = langCmd.subCommands?.[cmdArr[i]];
    }
    return langCmd?.[info] ?? '';
}
exports.commands.commands.send = (...msg) => {
    const out = msg.join(' ');
    if (!out) {
        info(getCmdInfo('send'));
        return;
    }
    exports.bot.chat(out);
};
exports.commands.commands.position = () => {
    const pos = exports.bot.entity.position;
    info(`Position: ${Number(pos.x.toFixed(3))}, ${Number(pos.y.toFixed(3))}, ${Number(pos.z.toFixed(3))}`);
};
exports.commands.commands.distance = (x1, y1, z1, x2, y2, z2) => {
    if (!(0, index_js_1.isNumber)(x1) || !(0, index_js_1.isNumber)(y1) || !(0, index_js_1.isNumber)(z1) || !(0, index_js_1.isNumber)(x2) || !(0, index_js_1.isNumber)(y2) || !(0, index_js_1.isNumber)(z2)) {
        info(getCmdInfo('distance'));
        return;
    }
    const point1 = (0, vec3_js_1.v)(x1, y1, z1);
    const point2 = (0, vec3_js_1.v)(x2, y2, z2);
    info(`Distance: ${Number((0, index_js_1.distance)(point1, point2).toFixed(3))}`);
};
exports.commands.commands.list = () => {
    let out = '';
    for (const player in exports.bot.players) {
        if (Object.hasOwnProperty.call(exports.bot.players, player)) {
            const playerInfo = exports.bot.players[player];
            out = `${out} ${playerInfo.username} [${playerInfo.ping}]`;
        }
    }
    info(`Player list:${out}`);
};
exports.commands.commands.blocks = async (range, count, filter) => {
    if ((!(0, index_js_1.isNumber)(range) || range <= 0) || (!(0, index_js_1.isNumber)(count) && count !== undefined)) {
        info(getCmdInfo('blocks'));
        return;
    }
    const blocksCoords = exports.bot.findBlocks({
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
        const block = exports.bot.blockAt(blockPos);
        if ((block?.displayName?.match(regex) == null)) {
            continue;
        }
        print(`       ${logger.info.color}${block.position.x}, ${block.position.y} ${block.position.z}  ${block.displayName}: ${String(block.diggable)}${ansi.color.reset}`);
        blockCount++;
    }
    info('Count: ' + String(blockCount));
};
async function botDig(pos, forceLook, type, silent = true) {
    if (exports.commands.tmp.botDigging || exports.commands.tmp.botLooking || exports.commands.tmp.botAttacking) {
        return;
    }
    const block = exports.bot.blockAt(pos);
    if (block === null || !block.diggable) {
        if (!silent)
            warn('Block is undiggable');
        return false;
    }
    try {
        await exports.bot.dig(block, forceLook, type);
    }
    catch (err) {
        if (!silent)
            warn(translatable_js_1.currentLang.data.infoMessages.cantDigBlockAt(pos.x, pos.y, pos.z, err));
        return false;
    }
    return true;
}
exports.commands.commands.dig = async (x, y, z) => {
    if (!(0, index_js_1.isNumber)(x) || !(0, index_js_1.isNumber)(y) || !(0, index_js_1.isNumber)(z)) {
        info(getCmdInfo('dig'));
        return;
    }
    if (exports.commands.tmp.botDigging || exports.commands.tmp.botLooking || exports.commands.tmp.botAttacking) {
        warn(translatable_js_1.currentLang.data.infoMessages.botLookingOrAttackingErr);
        return true;
    }
    const botDigPromise = botDig((0, vec3_js_1.v)(x, y, z), true, 'raycast');
    exports.commands.tmp.botLooking = true;
    exports.commands.tmp.botDigging = true;
    if (await botDigPromise) {
        success(`Dug block at ${x}, ${y}, ${z}`);
    }
    exports.commands.tmp.botLooking = false;
    exports.commands.tmp.botDigging = false;
};
exports.commands.commands.stopDig = () => {
    exports.bot.stopDigging();
    success('Stopped digging');
};
const digQueue = new taskQueue_js_1.TaskQueue();
const digMapAddedCoordinates = [];
exports.commands.commands.digMap = async (subCmd, ...args) => {
    if (!['add', 'remove', 'clear', 'addspace', 'show'].includes(subCmd?.toLowerCase())) {
        info(getCmdInfo('digMap'));
        return;
    }
    const subCommands = {
        add(x, y, z) {
            if (!(0, index_js_1.isNumber)(x) || !(0, index_js_1.isNumber)(y) || !(0, index_js_1.isNumber)(z)) {
                info(getCmdInfo('digMap.add'));
                return;
            }
            const coords = `${x}, ${y}, ${z}`;
            if (digMapAddedCoordinates.includes(coords)) {
                return;
            }
            exports.commands.commands.digMap.onBlockUpdate(undefined, exports.bot.blockAt((0, vec3_js_1.v)(x, y, z)));
            exports.bot.on(`blockUpdate:(${coords})`, exports.commands.commands.digMap.onBlockUpdate);
            digMapAddedCoordinates.push(coords);
        },
        remove(x, y, z) {
            if (!(0, index_js_1.isNumber)(x) || !(0, index_js_1.isNumber)(y) || !(0, index_js_1.isNumber)(z)) {
                info(getCmdInfo('digMap.remove'));
                return;
            }
            const coords = `${x}, ${y}, ${z}`;
            const index = digMapAddedCoordinates.indexOf(coords);
            if (index === -1) {
                return;
            }
            exports.bot.off(`blockUpdate:(${coords})`, exports.commands.commands.digMap.onBlockUpdate);
            digMapAddedCoordinates.splice(index, 1);
        },
        clear() {
            while (digMapAddedCoordinates.length !== 0) {
                const coords = digMapAddedCoordinates.shift();
                exports.bot.off(`blockUpdate:(${coords})`, exports.commands.commands.digMap.onBlockUpdate);
            }
        },
        addspace(x1, y1, z1, x2, y2, z2) {
            if (!(0, index_js_1.isNumber)(x1) || !(0, index_js_1.isNumber)(y1) || !(0, index_js_1.isNumber)(z1) || !(0, index_js_1.isNumber)(x2) || !(0, index_js_1.isNumber)(y2) || !(0, index_js_1.isNumber)(z2)) {
                info(getCmdInfo('digMap.addspace'));
                return;
            }
            const points = (0, pointsInBetween_js_1.pointsInBetween)((0, vec3_js_1.v)(x1, y1, z1), (0, vec3_js_1.v)(x2, y2, z2));
            for (const vec of points) {
                this.add(vec.x, vec.y, vec.z);
            }
        },
        show() {
            info('Added blocks:\n' + digMapAddedCoordinates.join('\n'));
        }
    };
    await subCommands[subCmd.toLowerCase()](...args);
};
exports.commands.commands.digMap.onBlockUpdate = (oldBlock, newBlock) => {
    if (!newBlock.diggable) {
        return;
    }
    const addTask = (currentDepth) => {
        if (exports.commands.tmp.botDigging || exports.commands.tmp.botLooking || exports.commands.tmp.botAttacking) {
            return;
        }
        void digQueue.add(async () => {
            const digSuccess = await botDig(newBlock.position, true, 'raycast', true);
            if (!digSuccess) {
                if (currentDepth >= 3) {
                    if (currentDepth < 8) {
                        await (0, sleep_js_1.sleep)(250);
                    }
                    else if (currentDepth < 15) {
                        await (0, sleep_js_1.sleep)(600);
                    }
                    else {
                        return;
                    }
                }
                addTask(currentDepth + 1);
            }
        });
    };
    addTask(0);
};
exports.commands.commands.place = async (x, y, z) => {
    if (exports.commands.tmp.botLooking || exports.commands.tmp.botAttacking) {
        warn(translatable_js_1.currentLang.data.infoMessages.botLookingOrAttackingErr);
        return true;
    }
    if (!(0, index_js_1.isNumber)(x) || !(0, index_js_1.isNumber)(y) || !(0, index_js_1.isNumber)(z)) {
        info(getCmdInfo('place'));
        return;
    }
    exports.commands.tmp.botLooking = true;
    try {
        const position = (0, vec3_js_1.v)(x, y, z);
        await mcUtils.placeBlock(position);
    }
    catch (e) {
        const err = e;
        switch (err.message) {
            case 'x, y and z must be numbers':
                info(getCmdInfo('place'));
                break;
            case 'Block is not empty':
                warn(translatable_js_1.currentLang.data.infoMessages.alreadyBlockThere);
                break;
            case 'There are no valid blocks next to there':
                warn(translatable_js_1.currentLang.data.infoMessages.blockPlaceAdjErr);
                break;
            case 'Impossible to place block from this angle':
                warn(err.message);
                break;
            default:
                error(`Could not place block.\n${err.message}`, true, err);
                break;
        }
        return;
    }
    finally {
        exports.commands.tmp.botLooking = false;
    }
    success('Successfully placed block');
};
exports.commands.commands.moveTo = async (X, Z, mustBeUndefined) => {
    if (!(0, index_js_1.isNumber)(X) || !(0, index_js_1.isNumber)(Z) || mustBeUndefined !== undefined) {
        info(getCmdInfo('moveTo'));
        return;
    }
    info(`Attempting to move to ${X}, ${Z}`);
    try {
        await mcUtils.moveXZ(X, Z);
    }
    catch (err) {
        error('Bot got stuck and couldn\'t reach its destination', true, err);
        return;
    }
    success(`Moved to ${X}, ${Z}`);
};
exports.commands.commands.move = async (direction, distance) => {
    if (!direction || (distance !== undefined && distance <= 0)) {
        info(getCmdInfo('move'));
        return;
    }
    if (exports.commands.tmp.botMoving) {
        warn(translatable_js_1.currentLang.data.infoMessages.botMovingErr);
        return;
    }
    distance = distance || 1;
    let x = 0;
    let z = 0;
    switch (direction) {
        case 'north':
            z = -distance;
            break;
        case 'south':
            z = distance;
            break;
        case 'east':
            x = distance;
            break;
        case 'west':
            x = -distance;
            break;
        default:
            info('Usage: .move <Direction:north|south|east|west> <distance?>. Distance > 0');
            return;
    }
    if (!Number.isInteger(distance)) {
        warn('Distance must be an integer');
        return;
    }
    exports.commands.tmp.botMoving = true;
    let unit;
    if (distance === 1)
        unit = 'block';
    else
        unit = 'blocks';
    info(`Attempting to move ${direction} for ${distance} ${unit}`);
    const position = exports.bot.entity?.position;
    try {
        await mcUtils.moveXZ(position.x + x, position.z + z, 0, Infinity);
    }
    catch (e) {
        const err = e;
        warn(`${err.message}.\nStopped moving`);
        return;
    }
    finally {
        exports.commands.tmp.botMoving = false;
    }
    success(`Moved ${direction} for ${distance} ${unit}`);
};
async function botFollow(matchesStr, range) {
    if (this.tmp.botMoving) {
        return;
    }
    const sprintState = exports.bot.getControlState('sprint');
    const jumpState = exports.bot.getControlState('jump');
    exports.commands.tmp.botMoving = true;
    while (exports.commands.tmp.botMoving) {
        await (0, sleep_js_1.sleep)(150);
        const entity = exports.bot.nearestEntity((entity) => {
            try {
                return (0, utils_js_1.matchEq)(matchesStr, entity);
            }
            catch {
                if (!err)
                    err = true;
            }
        });
        if (!entity) {
            continue;
        }
        await mcUtils.followEntityWithJump(entity, range);
    }
    exports.bot.setControlState('sprint', sprintState);
    exports.bot.setControlState('jump', jumpState);
}
exports.commands.commands.follow = async (matchesStr, range) => {
    if (exports.commands.tmp.botMoving) {
        warn(translatable_js_1.currentLang.data.infoMessages.botMovingErr);
        return;
    }
    if (!['string', 'boolean'].includes(typeof matchesStr) || !(0, index_js_1.isNumber)(range) || range <= 0) {
        info(getCmdInfo('follow'));
        return;
    }
    try {
        (0, utils_js_1.matchEq)(matchesStr, {});
    }
    catch {
        info(getCmdInfo('follow'));
        return;
    }
    let unit;
    if (range === 1)
        unit = 'block';
    else
        unit = 'blocks';
    success(`Following nearest entity if ${matchesStr} with a range of ${range} ${unit}`);
    void botFollow(matchesStr, range);
    exports.commands.tmp.botMoving = true;
};
exports.commands.commands.pathfind = async (X, ZOrY, Z) => {
    if (!(0, index_js_1.isNumber)(X) || !(0, index_js_1.isNumber)(ZOrY) || (!(0, index_js_1.isNumber)(Z) && Z !== undefined)) {
        info(getCmdInfo('pathfind'));
        return;
    }
    if (exports.commands.tmp.botMoving) {
        warn(translatable_js_1.currentLang.data.infoMessages.botMovingErr);
        return;
    }
    let goal;
    let ZAndYStr;
    if (Z) {
        goal = new mineflayer_pathfinder_1.goals.GoalBlock(X, ZOrY, Z);
        ZAndYStr = `${ZOrY}, ${Z}`;
    }
    else {
        goal = new mineflayer_pathfinder_1.goals.GoalXZ(X, ZOrY);
        ZAndYStr = String(ZOrY);
    }
    exports.commands.tmp.botMoving = true;
    info(`Attempting to move to ${X}, ${ZAndYStr}`);
    await exports.bot.pathfinder.goto(goal)
        .catch((e) => {
        const err = e;
        error(`Could not move to ${X}, ${ZAndYStr}.\n${err.message}`, true, err);
        exports.commands.tmp.botMoving = false;
    });
    success(`Moved to ${X}, ${ZAndYStr}`);
    exports.commands.tmp.botMoving = false;
};
exports.commands.commands.forceMove = async (direction, time) => {
    if ((direction === 'up' || direction === 'forward' || direction === 'back' || direction === 'left' || direction === 'right' || direction === 'sprint') && (0, index_js_1.isNumber)(time)) {
        info(`Moving ${direction} for ${time} seconds`);
        if (direction === 'up')
            direction = 'jump';
        exports.bot.setControlState(direction, true);
        await (0, sleep_js_1.sleep)(time * 1000);
        exports.bot.setControlState(direction, false);
        success(`Moved ${direction} for ${time} seconds`);
    }
    else
        info(getCmdInfo('forceMove'));
};
exports.commands.commands.control = (control, state) => {
    if (['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].includes(control) && typeof state === 'boolean') {
        exports.bot.setControlState(control, state);
        success(`Set control state ${control} to ${String(state)}`);
    }
    else if (control === 'clearall') {
        exports.bot.clearControlStates();
        success('Cleared all control states');
    }
    else {
        try {
            logger.debugging(`That's not an input, silly! You expect the bot to go ${control} or what? :)`);
            info(getCmdInfo('control'));
        }
        catch (err) {
            error(`Exception occured: ${err}`);
        }
    }
};
async function botSmartFollow(matchesStr, range) {
    logger.debugging('Still working!');
    if (!matchesStr || !range) {
        return;
    }
    (0, utils_js_1.matchEq)(matchesStr, {});
    if (exports.commands.tmp.Debugging.triggered)
        void (0, debugging_1.nothing)();
    else {
        logger.debugging(`Matches: ${(0, utils_js_1.matchEq)(matchesStr, {})}`, true, false);
        exports.commands.tmp.Debugging.triggered = true;
        void (0, debugging_1.nothing)();
    }
    while (exports.commands.tmp.botMoving) {
        const entity = exports.bot.nearestEntity((entity) => {
            try {
                return entity ? (0, utils_js_1.matchEq)(matchesStr, entity) : false;
            }
            catch { }
        });
        if (((entity?.position) == null) || !exports.bot.entity?.position) {
            await (0, sleep_js_1.sleep)(150);
            continue;
        }
        const dist = (0, index_js_1.distance)(exports.bot.entity.position, entity.position) - 0.67;
        if (dist < range) {
            await (0, sleep_js_1.sleep)(500);
            continue;
        }
        const goal = new mineflayer_pathfinder_1.goals.GoalFollow(entity, range);
        try {
            await exports.bot.pathfinder.goto(goal);
        }
        catch {
            await (0, sleep_js_1.sleep)(3000);
        }
    }
    void exports.commands.commands.revertDebugValues();
}
exports.commands.commands.revertDebugValues = function () {
    (0, sleep_js_1.sleep)(3000);
    exports.commands.tmp.Debugging.triggered = false;
};
exports.commands.commands.smartFollow = async (matchesStr, range) => {
    if (exports.commands.tmp.botMoving) {
        warn(translatable_js_1.currentLang.data.infoMessages.botMovingErr);
        return;
    }
    if (!['string', 'boolean'].includes(typeof matchesStr) || !(0, index_js_1.isNumber)(range) || range <= 0) {
        info(getCmdInfo('smartFollow'));
        return;
    }
    try {
        (0, utils_js_1.matchEq)(matchesStr, {});
    }
    catch {
        info(getCmdInfo('smartFollow'));
        return;
    }
    let unit;
    if (range === 1)
        unit = 'block';
    else
        unit = 'blocks';
    success(`Following nearest entity if ${matchesStr} with a range of ${range} ${unit}`);
    exports.commands.tmp.botMoving = true;
    void botSmartFollow(matchesStr, range);
};
function botUnfollow() {
    exports.commands.tmp.botMoving = false;
}
exports.commands.commands.unFollow = () => {
    botUnfollow();
    success('Not following anyone');
};
exports.commands.commands.attack = (matchesStr, cps, reach, minreach, force = true) => {
    if (exports.commands.tmp.botAttacking) {
        warn('Player is already attacking someone. Use ".stopattack"');
        return;
    }
    if (exports.commands.tmp.botLooking) {
        warn('Player is looking at someone. Use ".stoplook"');
        return;
    }
    const usage = getCmdInfo('attack');
    if (!['string', 'boolean'].includes(typeof matchesStr) || !(0, index_js_1.isNumber)(cps) || !(0, index_js_1.isNumber)(reach) || !(0, index_js_1.isNumber)(minreach) || cps <= 0 || reach <= 0 || reach < minreach) {
        info(usage);
        return;
    }
    try {
        (0, utils_js_1.matchEq)(matchesStr, {});
    }
    catch {
        info(usage);
        return;
    }
    exports.commands.tmp.botLooking = true;
    exports.commands.tmp.botAttacking = true;
    success(`Attacking nearest entity with ${cps}CPS if ${matchesStr} and if the entity is as close as ${minreach} blocks and within range of ${reach}`);
    const yaw = exports.bot.entity.yaw;
    const pitch = exports.bot.entity.pitch;
    void (async () => {
        while (exports.commands.tmp.botAttacking) {
            await (0, sleep_js_1.sleep)(1000 / cps);
            let err = false;
            await mcUtils.botAttack(minreach, reach, exports.bot.nearestEntity((entity) => {
                try {
                    if ((0, utils_js_1.matchEq)(matchesStr, entity) && (entity.type === 'player' || entity.type === 'mob' || entity.type === 'animal')) {
                        return true;
                    }
                }
                catch {
                    err = true;
                }
            }), force);
            if (err) {
                exports.commands.tmp.botAttacking = false;
                exports.commands.tmp.botLooking = false;
                error('Invalid EntityMatches');
            }
        }
        await exports.bot.look(yaw, pitch, true);
    })();
};
exports.commands.commands.stopAttack = () => {
    if (exports.commands.tmp.botLooking && !exports.commands.tmp.botAttacking) {
        warn('Cannot use ".stopattack" as bot is looking at something. Use ".stoplook" instead :)');
        return;
    }
    exports.commands.tmp.botAttacking = false;
    exports.commands.tmp.botLooking = false;
    success('Stopped attacking');
};
exports.commands.commands.look = async (directionOrYaw, pitchOrForce, force) => {
    const isDirection = (0, index_js_2.isString)(directionOrYaw) && Object.keys(mcUtils.directionToYaw).includes(directionOrYaw);
    const yaw = isDirection ? mcUtils.directionToYaw[directionOrYaw] : directionOrYaw;
    const pitch = isDirection ? undefined : pitchOrForce;
    force = isDirection ? pitchOrForce : force;
    if (!((0, index_js_1.isNumber)(yaw) || yaw === undefined) || !((0, index_js_1.isNumber)(pitch) || pitch === undefined) || (yaw === undefined && pitch === undefined)) {
        info(translatable_js_1.currentLang.data.commands.look.usage);
        return;
    }
    try {
        logger.debugging(`Value: ${pitch}`);
        await mcUtils.look(yaw, pitch, force);
        success(`Set ${yaw !== undefined ? `yaw (rotation to left/right) to ${yaw}` : ''}` +
            `${yaw !== undefined && pitch !== undefined ? ' and ' : ''}` +
            `${pitch !== undefined ? `pitch (up and down rotation) to ${pitch}` : ''}`);
    }
    catch (err) {
        logger.debugging(`Exception occured: ${err}`);
    }
};
exports.commands.commands.lookAt = (playerName, maxReach, minReach = maxReach, force) => {
    if (!playerName || maxReach <= 0 || maxReach <= minReach) {
        info(getCmdInfo('lookAt'));
        return;
    }
    if (exports.commands.tmp.botLooking || exports.commands.tmp.botAttacking) {
        warn(translatable_js_1.currentLang.data.infoMessages.botLookingOrAttackingErr);
        return true;
    }
    exports.commands.tmp.botLooking = true;
    if (force === 'yes' || force === 'y') {
        force = true;
    }
    else {
        force = false;
    }
    void (async () => {
        while (exports.commands.tmp.botLooking) {
            if (exports.bot.players[playerName]?.entity?.position) {
                const dist = (0, index_js_1.distance)(exports.bot.players[playerName]?.entity?.position, exports.bot.entity.position);
                if (dist < maxReach && dist > minReach) {
                    await mcUtils.lookAtVecMaxReach(exports.bot.players[playerName].entity.position, exports.bot.players[playerName].entity.height, exports.bot.players[playerName].entity.width, force);
                }
            }
            await (0, sleep_js_1.sleep)(100);
        }
    })();
    let withForce = 'without';
    if (force) {
        withForce = 'with';
    }
    success(`Looking at ${playerName} if MinReach(${minReach}) < distance < MaxReach(${maxReach}) ${withForce} force`);
};
exports.commands.commands.stopLook = () => {
    if (exports.commands.tmp.botAttacking) {
        warn('Cannot use ".stoplook" because player is attacking someone\nConsider ".stopattack"');
        return;
    }
    exports.commands.tmp.botLooking = false;
    info('Not looking at anyone');
};
const parseItemName = (item) => {
    const name = item?.nbt?.value?.display?.value?.Name ??
        item?.displayName ??
        item?.name ??
        'unknown_name (bug)';
    let out = name;
    try {
        out = new ChatMessage(JSON.parse(name)).toMotd();
    }
    catch { }
    return out?.value ?? out;
};
function renderWindow(window, options) {
    const inventoryItems = mcUtils.getItems(window);
    const a = (items) => {
        if (items.length < 1) {
            return 'Empty';
        }
        const make = (item, itemName, d = '') => {
            let a = exports.bot.inventory.inventoryStart;
            if (item.slot > exports.bot.inventory.inventoryEnd) {
                a = -a;
            }
            let hotBarNum = a - (exports.bot.inventory.inventoryEnd - item.slot);
            if (!(0, index_js_1.isNumber)(hotBarNum) || hotBarNum < 0) {
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
    info(a(inventoryItems) +
        '\n' +
        `\nCrafting result slot: ${window.craftingResultSlot}` +
        `\nInventory start: ${window.inventoryStart}` +
        `\nInventory end: ${window.inventoryEnd}` +
        `\nHotbar start: ${window.hotbarStart}` +
        `\nSelected slot: ${exports.bot.quickBarSlot}`);
}
exports.commands.commands.inventory = async (windowID, subCommand, ...args) => {
    if (![0, 1, 'inventory', 'container'].includes(windowID)) {
        info(getCmdInfo('inventory'));
        return;
    }
    const isContainer = [1, 'container'].includes(windowID);
    if (isContainer && !exports.bot.currentWindow) {
        info(translatable_js_1.currentLang.data.infoMessages.noContainerOpenRN);
        return;
    }
    const currentWindow = (isContainer && exports.bot.currentWindow) ? exports.bot.currentWindow : exports.bot.inventory;
    const runSubCommand = async (cmd, args) => {
        const checkIfSlotIsValid = (slotID) => {
            if (typeof slotID !== 'number') {
                return false;
            }
            if (slotID < currentWindow?.inventoryStart || slotID >= currentWindow.inventoryEnd) {
                return false;
            }
            return true;
        };
        const close = () => {
            if (!isContainer) {
                warn('There is nothing to close');
                return;
            }
            info(`Closing window #${windowID}`);
            exports.bot.closeWindow(exports.bot.currentWindow);
        };
        const click = async (slotID, buttonIDName = 'left', buttonModeName) => {
            if (checkIfSlotIsValid(slotID) || !(0, index_js_2.isString)(buttonIDName)) {
                info(getCmdInfo('inventory.click'));
                return;
            }
            const buttonID = buttonIDName === 'right' ? 1 : 0;
            const buttonMode = 0;
            info(`${buttonIDName} clicking slot ${String(slotID)} in window #${windowID}`);
            await exports.bot.clickWindow(slotID, buttonID, buttonMode);
        };
        const swap = async (slot1ID, slotDestID) => {
            if (!checkIfSlotIsValid(slot1ID) || !checkIfSlotIsValid(slotDestID)) {
                info(getCmdInfo('inventory.swap'));
                return;
            }
            info(`Swapping item at slot ${slot1ID} with item at slot ${slotDestID} in window #${windowID}`);
            await exports.bot.clickWindow(inventoryStartOffset + slot1ID, 0, 0);
            await (0, sleep_js_1.sleep)(20);
            await exports.bot.clickWindow(inventoryStartOffset + slotDestID, 0, 0);
            await (0, sleep_js_1.sleep)(20);
            await exports.bot.clickWindow(inventoryStartOffset + slot1ID, 0, 0);
        };
        const drop = async (slotIDs) => {
            if (slotIDs.length === 0) {
                info(getCmdInfo('inventory.drop'));
                return;
            }
            for (const slotID of slotIDs) {
                if (!checkIfSlotIsValid(slotID)) {
                    info(translatable_js_1.currentLang.data.commands.inventory?.subCommands?.drop?.usage);
                    return;
                }
            }
            info(`Dropping items in slots ${slotIDs.join(', ')} in window #${windowID}`);
            for (const slotID of slotIDs) {
                await exports.bot.clickWindow(inventoryStartOffset + slotID, 0, 0);
                await (0, sleep_js_1.sleep)(10);
                await exports.bot.clickWindow(-999, 0, 0);
            }
        };
        const dropall = async () => {
            const items = isContainer
                ? mcUtils.getItems(exports.bot.currentWindow, exports.bot.inventory.inventoryEnd)
                : exports.bot.inventory.items();
            info(`Dropping all items in window #${windowID}`);
            for (let i = 0; i < items.length; i++) {
                await exports.bot.clickWindow(inventoryStartOffset + items[i].slot, 0, 0);
                await (0, sleep_js_1.sleep)(10);
                await exports.bot.clickWindow(-999, 0, 0);
            }
        };
        const inventoryStartOffset = (!isContainer && exports.bot.currentWindow?.inventoryEnd && exports.bot.inventory?.inventoryEnd)
            ? exports.bot.currentWindow.inventoryEnd - exports.bot.inventory.inventoryEnd
            : 0;
        cmd = cmd.toLowerCase();
        args = (0, utils_js_1.toLowerCaseArr)(args);
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
exports.commands.commands.open = async (x, y, z) => {
    if (!(0, index_js_1.isNumber)(x) || !(0, index_js_1.isNumber)(y) || !(0, index_js_1.isNumber)(z)) {
        info(getCmdInfo('open'));
        return;
    }
    if (exports.commands.tmp.botLooking || exports.commands.tmp.botAttacking) {
        warn(translatable_js_1.currentLang.data.infoMessages.botLookingOrAttackingErr);
        return true;
    }
    const blockPos = (0, vec3_js_1.v)(x, y, z);
    const block = exports.bot.blockAt(blockPos);
    info('Attempting to open container');
    await exports.bot.openContainer(block)
        .then(() => {
        success('Opened the container');
    })
        .catch((err) => {
        error(err.message, true, err);
    });
};
exports.commands.commands.changeSlot = (slot) => {
    if ((0, index_js_1.isNumber)(slot) && slot > -1 && slot < 9) {
        exports.bot.setQuickBarSlot(slot);
        info(`Changed slot to ${slot}`);
    }
    else
        info(getCmdInfo('changeSlot'));
};
exports.commands.commands.useItem = async (sec) => {
    if (sec > 3) {
        info(`Using an item for ${sec ?? 0.1}s`);
    }
    exports.bot.activateItem();
    await (0, sleep_js_1.sleep)(sec * 1000);
    exports.bot.deactivateItem();
    success(`Used an item for ${sec}s`);
};
exports.commands.commands.set = (key, value) => {
    if (key === undefined) {
        info(getCmdInfo('set'));
        return;
    }
    exports.commands.tmp.variables[key] = value;
    success(`Set %${key}% to ${String(value)}`);
};
exports.commands.commands.unset = (key) => {
    if (key === undefined) {
        info(getCmdInfo('unset'));
        return;
    }
    delete exports.commands.tmp.variables[key];
    success(`Deleted %${key}%`);
};
exports.commands.commands.value = (key) => {
    if (key === undefined) {
        info(getCmdInfo('value'));
        return;
    }
    info(`${key}: ${String(exports.commands.tmp.variables[key])}`);
};
exports.commands.commands.variables = () => {
    const values = Object.values(exports.commands.tmp.variables);
    const keys = Object.keys(exports.commands.tmp.variables);
    let out = '';
    if (keys[0] !== undefined)
        out = `${keys[0]}: ${String(values[0])}`;
    for (let i = 1; i < values.length; i++) {
        if (keys[i] === undefined)
            continue;
        out = `${out}\n${keys[i]}: ${String(values[i])}`;
    }
    info('Values:\n' + out);
};
exports.commands.commands.script = async (pathToSrc) => {
    if (!pathToSrc) {
        info(getCmdInfo('script'));
        return;
    }
    try {
        (0, fs_1.accessSync)(pathToSrc, fs_1.constants.F_OK);
    }
    catch (err) {
        info('Unable to access file');
        return;
    }
    const data = (0, fs_1.readFileSync)(pathToSrc, { encoding: 'UTF8' });
    for (const line of data.split(/[\n;]/)) {
        await exports.commands.interpret(line, { type: 'script' });
    }
};
exports.commands.commands.version = () => {
    info(`${package_js_1._package.name} version: ${package_js_1._package.version}\nNode version: ${process.version}`);
};
exports.commands.commands.wait = async (sec) => {
    await (0, sleep_js_1.sleep)(sec * 1000);
};
exports.commands.commands.async = async (...input) => {
    if (!input[0]) {
        warn('No command provided');
        return;
    }
    void exports.commands.interpret(input.join(' '), { type: 'script' });
};
exports.commands.commands.print = print;
exports.commands.commands.success = success;
exports.commands.commands.info = info;
exports.commands.commands.warn = warn;
exports.commands.commands.error = error;
exports.commands.commands.help = () => {
    const getCmdDesc = (cmd) => {
        if (exports.reservedCommandNames.includes(cmd)) {
            return null;
        }
        return getCmdInfo(cmd, 'description');
    };
    let out = '';
    const commandNames = Object.keys(exports.commands.commands);
    for (let a = 0; a < commandNames.length; a++) {
        const command = commandNames[a];
        if (exports.reservedCommandNames.includes(command)) {
            continue;
        }
        let end = '\n';
        if (a === commandNames.length - 2) {
            end = '';
        }
        out += '.' + (0, tabulate_js_1.tab)(command, getCmdDesc(command) ?? '', 15) + end;
    }
    info(out);
};
