"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highLight1 = exports.success = exports.debugError = exports.error = exports.debugattempts = exports.debugcount = exports.debugging = exports.warn = exports.info = exports.setup = void 0;
const easy_ansi_1 = require("easy-ansi");
const translatable_js_1 = require("../lang/translatable.js");
const basic_chat_cli_1 = require("basic-chat-cli");
let settings;
let chat;
const setup = (_chat = chat, _settings = settings) => {
    chat = _chat;
    settings = _settings;
};
exports.setup = setup;
const print = (str, options) => {
    chat?.print ? chat.print(str, options) : (0, basic_chat_cli_1.print)(str, options);
};
const padNewLines = (str, spacenum, prefix = '') => {
    return str.replace(/\n/g, '\n' + prefix.padStart(spacenum + prefix.length, ' '));
};
const info = (str, resetCursor = true) => {
    const coloredStr = str.replace(/%COLOR%/g, exports.info.color);
    print(`${exports.info.color}[${translatable_js_1.currentLang.data.logger.info}] ${padNewLines(coloredStr, 7, exports.info.color) + easy_ansi_1.color.reset}`, { resetCursor, clearLine: true });
};
exports.info = info;
exports.info.color = easy_ansi_1.color.reset + easy_ansi_1.color.bold + easy_ansi_1.color.rgb(130, 130, 200);
const warn = (str, resetCursor = true) => {
    const coloredStr = str.replace(/%COLOR%/g, exports.warn.color);
    print(`${exports.warn.color}[${translatable_js_1.currentLang.data.logger.warn}] ${padNewLines(coloredStr, 7, exports.warn.color) + easy_ansi_1.color.reset}`, { resetCursor, clearLine: true });
};
exports.warn = warn;
exports.warn.color = easy_ansi_1.color.reset + easy_ansi_1.color.bold + easy_ansi_1.color.rgb(255, 255, 85);
let sleeping = false;
const debugging = (str, resetCursor = true, overrideSleep = false) => {
    increase_debug_success_count();
    if (sleeping) {
        increase_debug_attempt_count();
        return;
    }
    else if (exports.debugcount === 1) {
        increase_debug_attempt_count();
        return;
    }
    else {
        const coloredStr = str.replace(/%COLOR%/g, exports.debugging.color);
        print(`${exports.debugging.color}[${translatable_js_1.currentLang.data.logger.debug}] ${padNewLines(coloredStr, 7, exports.debugging.color) + easy_ansi_1.color.reset}`, { resetCursor, clearLine: true });
        sleeping = true;
        void sleep(2000);
        sleeping = false;
    }
    exports.debugcount = 0;
};
exports.debugging = debugging;
exports.debugging.color = easy_ansi_1.color.reset + easy_ansi_1.color.bold + easy_ansi_1.color.rgb(212, 175, 55);
exports.debugcount = 0;
exports.debugattempts = 0;
function increase_debug_attempt_count() {
    exports.debugattempts = exports.debugattempts + 1;
}
function increase_debug_success_count() {
    exports.debugcount = exports.debugcount + 1;
}
async function sleep(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
}
const error = (str, resetCursor = true) => {
    const coloredStr = str.replace(/%COLOR%/g, exports.error.color);
    print(`${exports.error.color}[${translatable_js_1.currentLang.data.logger.error}] ${padNewLines(coloredStr, 6, exports.error.color) + easy_ansi_1.color.reset}`, { resetCursor, clearLine: true });
};
exports.error = error;
exports.error.color = easy_ansi_1.color.reset + easy_ansi_1.color.bold + easy_ansi_1.color.rgb(255, 85, 85);
const debugError = (msg, resetCursor = true, err) => {
    if (settings.logging.debug && (err != null)) {
        process.stderr.write(easy_ansi_1.color.rgb(255, 80, 120) + (err.stack ?? '') + easy_ansi_1.color.reset);
        return;
    }
    (0, exports.error)(msg, resetCursor);
};
exports.debugError = debugError;
const success = (str, resetCursor = true) => {
    const coloredStr = str.replace(/%COLOR%/g, exports.success.color);
    print(`${exports.success.color}[${translatable_js_1.currentLang.data.logger.success}] ${padNewLines(coloredStr, 5, exports.success.color)}` +
        easy_ansi_1.color.reset, { resetCursor, clearLine: true });
};
exports.success = success;
exports.success.color = easy_ansi_1.color.reset + easy_ansi_1.color.bold + easy_ansi_1.color.rgb(85, 255, 85);
const highLight1 = (str) => {
    return exports.highLight1.color + str + easy_ansi_1.color.reset;
};
exports.highLight1 = highLight1;
exports.highLight1.color = easy_ansi_1.color.bold + easy_ansi_1.color.underline + easy_ansi_1.color.rgb(255, 85, 85);
