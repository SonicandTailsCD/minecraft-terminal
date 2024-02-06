#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const package_js_1 = require("./lib/helpers/package.js");
process.title = package_js_1._package.name;
const settings_js_1 = require("./config/settings.js");
const setOpts_js_1 = require("./init/setOpts.js");
const settings = new settings_js_1.Settings();
(0, setOpts_js_1.setOpts)(settings);
const log_js_1 = require("./lib/log.js");
(0, log_js_1.info)('Loading...', false);
const loadConfig_js_1 = require("./init/loadConfig.js");
const updateConfig_js_1 = require("./init/updateConfig.js");
const lang = tslib_1.__importStar(require("./lang/translatable.js"));
(0, updateConfig_js_1.updateConfig)();
Object.assign(settings.config.config, (0, loadConfig_js_1.load)(settings));
{
    const configLang = settings.config.config.config.language.toUpperCase();
    lang.languages[configLang]
        ? lang.setLang(lang.languages[configLang])
        : (0, log_js_1.error)(`Invalid language set in configuration '${configLang}'.\nFalling back to default (EN)`);
}
(0, log_js_1.info)(lang.currentLang.data.misc.loading, false);
const uncaughtExcep_js_1 = require("./init/uncaughtExcep.js");
const bot_js_1 = require("./lib/helpers/bot.js");
const importTOML_js_1 = require("./lib/helpers/importTOML.js");
const configPath_js_1 = require("./lib/helpers/configPath.js");
const overrideCred_js_1 = require("./init/overrideCred.js");
const promptCred_js_1 = require("./init/promptCred.js");
const makeChat_js_1 = require("./init/makeChat.js");
const commands_js_1 = require("./lib/commands.js");
const path_1 = require("path");
(0, overrideCred_js_1.overrideCred)(settings);
(0, uncaughtExcep_js_1.setUncaughtExcep)(settings);
const chat = (0, makeChat_js_1.makeChat)();
(0, log_js_1.setup)(chat, settings);
process.once('exit', () => {
    process.stdout.write('\n');
});
void (async () => {
    await (0, promptCred_js_1.promptCred)(settings, chat.readline);
    const port = settings.bot.cred.server.match(/(?<=:)\d+/)?.[0];
    if (port !== undefined) {
        settings.bot.cred.server = settings.bot.cred.server.match(/^[^:]+/)?.[0] ?? 'localhost';
        settings.bot.cred.port = Number(port);
    }
    (0, bot_js_1.setup)(chat, settings);
    await (0, bot_js_1.botMain)();
    const tasksTOMLPath = (0, path_1.join)(configPath_js_1.configPath, 'tasks.toml');
    const tasks = (0, importTOML_js_1.importTOML)(tasksTOMLPath);
    commands_js_1.commands.runTasks(tasks);
})();
