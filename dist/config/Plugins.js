"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugins = void 0;
const configPath_js_1 = require("../lib/helpers/configPath.js");
const index_js_1 = require("../lib/utils/strings/index.js");
const fs_1 = require("fs");
class Plugins {
    user = [];
    builtin = {};
    settings = {};
    constructor(options) {
        Object.assign(this, options);
        const pluginNames = [];
        for (const val of (0, fs_1.readdirSync)(configPath_js_1.builtinPluginsPath)) {
            pluginNames.push((0, index_js_1.displayName)(val));
        }
        const pluginEnable = {};
        for (const val of pluginNames) {
            pluginEnable[val] = false;
        }
        const pluginSettings = {
            socks5Proxy: {
                host: '0.0.0.0',
                port: 1080,
                username: '',
                password: ''
            },
            webView: {
                firstPerson: true,
                showTrail: false,
                port: 3000
            }
        };
        Object.assign(this.builtin, pluginEnable);
        Object.assign(this.settings, pluginSettings);
    }
}
exports.Plugins = Plugins;
