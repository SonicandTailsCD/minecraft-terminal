"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = void 0;
const tslib_1 = require("tslib");
const configPath_js_1 = require("../lib/helpers/configPath.js");
const fs_1 = require("fs");
const onlyKeepKeys_js_1 = require("../lib/utils/other/onlyKeepKeys.js");
const Config_js_1 = require("../config/Config.js");
const Plugins_js_1 = require("../config/Plugins.js");
const Tasks_js_1 = require("../config/Tasks.js");
const Physics_js_1 = require("../config/Physics.js");
const Credentials_js_1 = require("../config/Credentials.js");
const logger = tslib_1.__importStar(require("../lib/log.js"));
const merge_js_1 = require("../lib/utils/other/merge.js");
const toml_1 = tslib_1.__importDefault(require("@iarna/toml"));
const path_1 = require("path");
function modify(fileName, data, _default) {
    const remove = Object.assign({}, _default);
    if (fileName === 'plugins.toml') {
        (0, merge_js_1.mergeObjects)(remove, {
            settings: data.settings
        }, {
            mutate: true,
            typeCheck: true,
            typeCheckUndefined: false
        });
    }
    if (fileName === 'config.toml') {
        (0, merge_js_1.mergeObjects)(remove, {
            commands: {
                commandAliases: data.commands.commandAliases
            }
        }, {
            mutate: true,
            typeCheck: true,
            typeCheckUndefined: false
        });
    }
    if (fileName !== 'tasks.toml') {
        data = (0, onlyKeepKeys_js_1.onlyKeepKeys)(data, remove);
    }
    const add = Object.assign({}, _default);
    if (fileName === 'config.toml') {
        add.commands.commandAliases = {};
    }
    return (0, merge_js_1.mergeObjects)(add, data, { typeCheck: true, typeCheckUndefined: false });
}
function updateConfig() {
    const fileToCl = {
        'config.toml': Config_js_1.Config,
        'credentials.toml': Credentials_js_1.Credentials,
        'physics.toml': Physics_js_1.Physics,
        'plugins.toml': Plugins_js_1.Plugins,
        'tasks.toml': Tasks_js_1.Tasks
    };
    const validConfigFileNames = Object.keys(fileToCl);
    if (!(0, fs_1.existsSync)(configPath_js_1.configPath)) {
        (0, fs_1.mkdirSync)(configPath_js_1.configPath, { recursive: true });
    }
    validConfigFileNames.forEach(fileName => {
        if (!validConfigFileNames.includes(fileName)) {
            return;
        }
        const filePath = (0, path_1.join)(configPath_js_1.configPath, fileName);
        let out;
        try {
            const defaultData = new fileToCl[fileName]();
            let fileData;
            if ((0, fs_1.existsSync)(filePath)) {
                fileData = (0, fs_1.readFileSync)(filePath, { encoding: 'utf8' });
                const parsedFile = toml_1.default.parse(fileData);
                out = modify(fileName, parsedFile, defaultData);
            }
            else {
                out = defaultData;
            }
            out = toml_1.default.stringify(out).replace(/ {2}/g, '\t');
        }
        catch (err) {
            logger.debugError('An error occurred while trying to parse ' +
                `${fileName}.\n${err.message}`, true, err);
            process.exit(1);
        }
        try {
            (0, fs_1.writeFileSync)(filePath, out, 'utf-8');
        }
        catch (err) {
            logger.debugError('An error occurred while trying to update ' +
                `${fileName}.\n${err.message}`, true, err);
        }
    });
}
exports.updateConfig = updateConfig;
