"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinPluginsPath = exports.configPath = exports.filePath = void 0;
const fs_1 = require("fs");
const mainPath_js_1 = require("./mainPath.js");
const os_1 = require("os");
const path_1 = require("path");
const package_js_1 = require("./package.js");
const defaultDir = process.platform === 'win32' ? (0, path_1.join)(process.env.APPDATA ?? (0, os_1.homedir)(), package_js_1._package.name) : (0, path_1.join)((0, os_1.homedir)(), '.config', package_js_1._package.name);
exports.filePath = (0, path_1.join)(defaultDir, '.configPath');
function get() {
    if (!(0, fs_1.existsSync)(exports.filePath)) {
        (0, fs_1.mkdirSync)(defaultDir, { recursive: true });
        (0, fs_1.writeFileSync)(exports.filePath, defaultDir);
        return defaultDir;
    }
    const fileContent = (0, fs_1.readFileSync)(exports.filePath, { encoding: 'utf8' });
    if (!fileContent) {
        (0, fs_1.writeFileSync)(exports.filePath, defaultDir);
        return defaultDir;
    }
    return fileContent;
}
exports.configPath = get();
exports.builtinPluginsPath = (0, path_1.join)(mainPath_js_1.srcPath, 'builtin_plugins');
