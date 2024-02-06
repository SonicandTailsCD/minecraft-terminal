"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botMain = exports.setup = void 0;
const tslib_1 = require("tslib");
const utils_js_1 = require("../utils/other/utils.js");
const logger = tslib_1.__importStar(require("../log.js"));
const ansi = tslib_1.__importStar(require("easy-ansi"));
const mineflayer = tslib_1.__importStar(require("mineflayer"));
const translatable_js_1 = require("../../lang/translatable.js");
const commands = tslib_1.__importStar(require("../commands.js"));
const path_1 = tslib_1.__importDefault(require("path"));
const index_js_1 = require("../utils/strings/index.js");
const configPath_js_1 = require("./configPath.js");
const importTOML_js_1 = require("./importTOML.js");
const mainPath_js_1 = require("./mainPath.js");
const fs_1 = require("fs");
const merge_1 = require("merge");
const getPackage_js_1 = require("../getPackage.js");
const package_js_1 = require("./package.js");
const compareVer_js_1 = require("../compareVer.js");
const plugins_js_1 = require("../plugins.js");
let bot, chat, settings;
const beforeLoginMsgs = [];
let loggedIn = false;
function setup(CHAT, SETTINGS) {
    chat = CHAT;
    settings = SETTINGS;
    commands.setConfig({ settings, options: {} });
}
exports.setup = setup;
function connectErr(err) {
    logger.error(translatable_js_1.currentLang.data.infoMessages.connectErr + '\n' + err.message);
    process.exit(1);
}
function getCommandPrompt(name, server) {
    if (settings.config.config.config?.commands?.commandPrompt !== undefined) {
        return ansi.MCColor.c2c((0, utils_js_1.parseVar)(settings.config.config.config.commands.commandPrompt, { name, server }, {
            varPrefix: '%',
            varSuffix: '%',
            undefinedVar: 'undefined'
        }), '&');
    }
    else {
        return '>';
    }
}
async function handleInput(input, commandPrefix = '.') {
    if (!input) {
        return;
    }
    if (commandPrefix !== '' && input.startsWith(commandPrefix)) {
        await commands.commands.interpret(input.slice(1));
        return;
    }
    bot.chat(input);
}
async function botMain() {
    chat.readline.pause();
    ansi.clear.clearLine(true);
    logger.info(translatable_js_1.currentLang.data.misc.loading, false);
    const options = {
        auth: settings.bot.cred.auth || 'offline',
        username: settings.bot.cred.username,
        password: settings.bot.cred.password,
        host: settings.bot.cred.server,
        version: settings.bot.cred.version,
        port: settings.bot.cred.port,
        logErrors: false
    };
    commands.setConfig({ settings, options });
    (0, plugins_js_1.setup)({ settings, options });
    const plugins = getPlugins(settings);
    for (const plugin of plugins) {
        await (0, plugins_js_1.loadPlugin)(plugin, true);
    }
    logger.info(translatable_js_1.currentLang.data.misc.connection, false);
    try {
        bot = mineflayer.createBot(options);
    }
    catch (err) {
        connectErr(err);
    }
    await commands.setBot(bot);
    ansi.other.setMCVersion(bot.version);
    bot.once('error', connectErr);
    bot._client.once('connect', async () => {
        bot.off('error', connectErr);
        commands.commands.tmp.botMoving = false;
        commands.commands.tmp.botLooking = false;
        commands.commands.tmp.botAttacking = false;
        for (const plugin of plugins) {
            await (0, plugins_js_1.loadPlugin)(plugin, false);
        }
        logger.info(translatable_js_1.currentLang.data.misc.loggingIn, false);
        chat.readline.setPrompt(getCommandPrompt('Loading', settings.bot.cred.server));
        setListeners();
    });
    bot.once('login', async () => {
        logger.success(translatable_js_1.currentLang.data.misc.loggedIn);
        loggedIn = true;
        chat.readline.resume();
        chat.readline.setPrompt(getCommandPrompt(bot.username, settings.bot.cred.server));
        chat.readline.prompt();
        for (let i = 0; i < beforeLoginMsgs.length; i++) {
            onMessage(beforeLoginMsgs[i]);
        }
        chat.events.on('msgSent', ({ msg }) => {
            void handleInput(msg);
        });
    });
    return bot;
}
exports.botMain = botMain;
function getPlugins(settings, options) {
    if (!settings.config.enabled.plugins) {
        return [];
    }
    options = Object.assign({
        builtinPath: path_1.default.join(mainPath_js_1.srcPath, 'builtin_plugins')
    }, options);
    const enabledPluginPaths = [];
    const pluginConfig = (0, importTOML_js_1.importTOML)(path_1.default.join(configPath_js_1.configPath, 'plugins.toml'));
    {
        const builtinPluginNames = (0, fs_1.readdirSync)(options.builtinPath);
        builtinPluginNames.forEach((val, i, arr) => {
            arr[i] = (0, index_js_1.displayName)(val);
        });
        for (const val of builtinPluginNames) {
            if (pluginConfig.builtin[val]) {
                enabledPluginPaths.push(path_1.default.resolve(path_1.default.join(options.builtinPath, val + '.js')));
            }
        }
    }
    for (const val of pluginConfig.user) {
        enabledPluginPaths.push(val);
    }
    return enabledPluginPaths;
}
function setListeners() {
    bot.on('message', (rawmsg) => {
        if (loggedIn) {
            onMessage(rawmsg);
            return;
        }
        beforeLoginMsgs.push(rawmsg);
    });
    bot.on('death', () => {
        logger.warn(translatable_js_1.currentLang.data.infoMessages.death);
    });
    bot.once('end', async (reason) => {
        if (reason !== 'reconnect') {
            logger.info('Exiting');
            process.exit();
        }
    });
    bot.on('kicked', (reason) => {
        logger.warn(`Kicked from ${settings.bot.cred.server}:`);
        process.stdout.write(`${ansi.MCColor.c2c(reason, undefined, true) + ansi.color.reset}\n`);
    });
    bot.once('spawn', async () => {
        ansi.other.setTermTitle(`${bot.player?.username || settings.bot.cred.username} @ ${settings.bot.cred.server}`);
        const movements = (0, merge_1.recursive)(bot.pathfinder.movements, settings.config.config.config?.mineflayer.movements);
        if (settings.config.enabled.physics) {
            movements.bot.physics = (0, merge_1.recursive)(movements.bot.physics, settings.config.config.physics);
        }
        bot.pathfinder.setMovements(movements);
    });
}
function onMessage(rawmsg) {
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
async function checkForUpdates() {
    let version;
    try {
        version = (await (0, getPackage_js_1.getPackage)(package_js_1._package.name)).version;
    }
    catch {
        return;
    }
    const diff = (0, compareVer_js_1.compare)(version, package_js_1._package.version);
    if (diff > 0) {
        const coloredVerSplit = version.split('.');
        coloredVerSplit[diff - 1] = logger.highLight1(coloredVerSplit[diff - 1]) + '%COLOR%';
        const coloredVerStr = coloredVerSplit.join('.');
        logger.warn(`A new version (${coloredVerStr}) of '${package_js_1._package.name}' is out.\nUpdate with: npm up -g ${package_js_1._package.name}`);
    }
    else if (diff !== 0) {
        logger.warn(`You somehow have a newer version of '${package_js_1._package.name}' than the latest one available.\nConsider running: npm up -g ${package_js_1._package.name}`);
    }
}
