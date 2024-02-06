"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.Plugin = exports.PluginExports = exports.PluginExportsBefore = exports.setup = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const index_js_1 = require("./utils/strings/index.js");
const ansi = tslib_1.__importStar(require("easy-ansi"));
const commands_js_1 = require("./commands.js");
let ssettings;
function setup(_settings) {
    ssettings = _settings;
}
exports.setup = setup;
class PluginExportsBefore {
    settings = ssettings;
    ansi = ansi;
    print = commands_js_1.print;
    info = commands_js_1.info;
    warn = commands_js_1.warn;
    error = commands_js_1.error;
    success = commands_js_1.success;
}
exports.PluginExportsBefore = PluginExportsBefore;
class PluginExports {
    commands = commands_js_1.commands;
    reservedCommandNames = commands_js_1.reservedCommandNames;
    settings = ssettings;
    nonVanillaCommands = commands_js_1.nonVanillaCommands;
    bot = commands_js_1.bot;
    ansi = ansi;
    print = commands_js_1.print;
    info = commands_js_1.info;
    warn = commands_js_1.warn;
    error = commands_js_1.error;
    success = commands_js_1.success;
}
exports.PluginExports = PluginExports;
class Plugin {
    name;
    before;
    main;
    constructor(options) {
        Object.assign(this, options);
    }
    async run() {
        await this.before?.(new PluginExportsBefore(), ssettings);
        this.main?.(new PluginExports(), ssettings);
    }
}
exports.Plugin = Plugin;
async function loadPlugin(pluginPath, runBefOnly = false) {
    if (pluginPath === '') {
        return;
    }
    let pluginName = (0, index_js_1.displayName)(pluginPath);
    if (!(0, fs_1.existsSync)(pluginPath)) {
        if (!runBefOnly)
            (0, commands_js_1.warn)(`Plugin '${pluginName}' not found.\nPath: '${pluginPath}'`);
        return;
    }
    try {
        const pl = require(pluginPath);
        if (typeof pl.name === 'string') {
            pluginName = pl.name;
        }
        const plugin = new Plugin({
            name: pluginName,
            main: pl.main,
            before: pl.before
        });
        if (runBefOnly) {
            await plugin.before?.(new PluginExportsBefore(), ssettings);
            return;
        }
        (0, commands_js_1.success)(`Loaded plugin: '${pluginName}'`);
        plugin.main?.(new PluginExports(), ssettings);
    }
    catch (e) {
        const err = e;
        (0, commands_js_1.error)(`An error occured with the plugin '${pluginName}'.\n${err.message}\nIf this keeps happening you may need to remove the plugin`, true, err);
    }
}
exports.loadPlugin = loadPlugin;
