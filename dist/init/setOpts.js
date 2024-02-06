"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOpts = void 0;
const package_js_1 = require("../lib/helpers/package.js");
const parseArgs_js_1 = require("../lib/parseArgs.js");
const path_1 = require("path");
const fs_1 = require("fs");
const configPath_js_1 = require("../lib/helpers/configPath.js");
const parseArgs = new parseArgs_js_1.ParseArgs();
function setOpts(settings) {
    parseArgs.addopt(['--help', '-h'], 0, 'Show this help message.', () => {
        process.stdout.write(parseArgs.getHelp(package_js_1._package.name));
        process.exit();
    });
    parseArgs.addopt(['--version', '-v'], 0, 'Show version information.', () => {
        process.stdout.write(`${package_js_1._package.name} version: ${package_js_1._package.version}\nNode version: ${process.version}\n`);
        process.exit();
    });
    parseArgs.addopt(['--debug'], 2, 'Enable debug mode.', (params) => {
        const stackTraceLimit = Number(params[1]);
        if (Number.isInteger(stackTraceLimit) || stackTraceLimit === Infinity) {
            Error.stackTraceLimit = stackTraceLimit;
        }
        settings.logging.debug = true;
    });
    parseArgs.addopt(['--set-conf-path', '-scp'], 2, 'Set the config folder path.', (params) => {
        let dir = params[1] || '';
        dir = (0, path_1.resolve)(dir);
        (0, fs_1.writeFileSync)(configPath_js_1.filePath, dir, { encoding: 'utf8' });
        process.exit();
    });
    parseArgs.addopt(['--get-conf-path', '-gcp'], 0, 'Get the config folder path.', () => {
        process.stdout.write(configPath_js_1.configPath + '\n');
        process.exit();
    });
    parseArgs.addopt(['--no-cred', '-nc'], 0, 'Do not use the credentials file.', () => {
        settings.config.enabled.cred = false;
    });
    parseArgs.addopt(['--no-conf', '-ns'], 0, 'Use default config', () => {
        settings.config.enabled.config = false;
    });
    parseArgs.addopt(['--no-plugins', '-np'], 0, 'Do not load plugins specified in plugins file.', () => {
        settings.config.enabled.plugins = false;
    });
    parseArgs.addopt(['--cred', '-c'], 6, '<Auth> <Username> <Password> <Version> <Server>\nOverride credentials from CLI arguments.', (params) => {
        const credList = [
            'auth',
            'username',
            'password',
            'server',
            'version'
        ];
        for (let i = 1; i < params.length; i++) {
            const cred = credList[i - 1];
            if (params[i] !== '!') {
                if (params[i] !== undefined && params[i] !== '') {
                    settings.bot.cred[cred] = params[i];
                }
            }
            else
                settings.bot.cred[cred] = null;
        }
    });
    parseArgs.run();
}
exports.setOpts = setOpts;
