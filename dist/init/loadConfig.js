"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const log_js_1 = require("../lib/log.js");
const importTOML_js_1 = require("../lib/helpers/importTOML.js");
const path_1 = require("path");
const configPath_js_1 = require("../lib/helpers/configPath.js");
const readErr = (file, errorMsg) => {
    if (errorMsg) {
        (0, log_js_1.error)(`An error occurred while trying to read ${file}.\n${errorMsg}`);
    }
    else {
        (0, log_js_1.error)(`An error occurred while trying to read ${file}`);
    }
    process.exit(1);
};
function loadTOMLFile(name) {
    try {
        return (0, importTOML_js_1.importTOML)((0, path_1.join)(configPath_js_1.configPath, name));
    }
    catch (err) {
        return readErr(name, err.message);
    }
}
function load(settings) {
    const config = {};
    if (settings.config.enabled.plugins) {
        config.plugins = loadTOMLFile('plugins.toml');
    }
    else {
        (0, log_js_1.warn)('Not using plugins');
    }
    if (settings.config.enabled.config) {
        config.config = loadTOMLFile('config.toml');
    }
    else {
        (0, log_js_1.warn)('Using default config');
    }
    let physics;
    try {
        physics = (0, importTOML_js_1.importTOML)(`${configPath_js_1.configPath}/physics.toml`);
        if (physics.usePhysicsConfig === true) {
            (0, log_js_1.warn)(`Using custom physics. this will result in a ${(0, log_js_1.highLight1)('ban')}%COLOR% in most servers!`);
            (0, log_js_1.info)('You can disable it by editing usePhysicsConfig in physics.toml');
            settings.config.enabled.physics = true;
            delete physics.usePhysicsConfig;
            config.physics = physics;
        }
    }
    catch (err) {
        readErr('physics.toml', err.message);
    }
    if (settings.config.enabled.cred) {
        try {
            config.cred = {
                ...{
                    auth: undefined,
                    username: undefined,
                    password: undefined,
                    server: undefined,
                    version: undefined
                },
                ...(0, importTOML_js_1.importTOML)((0, path_1.join)(configPath_js_1.configPath, 'credentials.toml'))
            };
        }
        catch (err) {
            readErr('credentials.toml', err.message);
        }
    }
    return config;
}
exports.load = load;
