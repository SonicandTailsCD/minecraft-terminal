"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const Config_js_1 = require("./Config.js");
const Plugins_js_1 = require("./Plugins.js");
class Settings {
    logging = { debug: false };
    bot = {
        cred: {
            auth: '',
            username: '',
            password: undefined,
            server: '',
            version: '',
            port: 25565
        }
    };
    config = {
        enabled: {
            cred: true,
            config: true,
            plugins: true,
            physics: false
        },
        config: {
            cred: {},
            config: new Config_js_1.Config(),
            plugins: new Plugins_js_1.Plugins(),
            physics: {}
        }
    };
    constructor(options) {
        if (options)
            Object.assign(this, options);
    }
}
exports.Settings = Settings;
