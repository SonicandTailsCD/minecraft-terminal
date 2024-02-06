"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeChat = void 0;
const tslib_1 = require("tslib");
const logger = tslib_1.__importStar(require("../lib/log.js"));
const basic_chat_cli_1 = require("basic-chat-cli");
const easy_ansi_1 = require("easy-ansi");
const commands_js_1 = require("../lib/commands.js");
const prompt_js_1 = require("../lib/helpers/prompt.js");
function makeChat() {
    const chat = new basic_chat_cli_1.Chat({
        readLineOpts: {
            input: process.stdin,
            output: process.stdout,
            prompt: ''
        }
    });
    chat.readline.once('close', () => {
        process.stdout.write('\n');
        process.exit();
    });
    chat.events.on('msgReceived', ({ msg }) => {
        chat.print(msg);
    });
    chat.readline.on('line', () => {
        chat.readline.prompt(false);
    });
    (0, prompt_js_1.setInterface)(chat.readline);
    commands_js_1.events.on('msg', (msg, resetCursor) => {
        chat.print(easy_ansi_1.MCColor.c2c(msg), { resetCursor });
    });
    commands_js_1.events.on('msg_info', (msg, resetCursor) => {
        logger.info(easy_ansi_1.MCColor.c2c(msg), resetCursor);
    });
    commands_js_1.events.on('msg_warn', (msg, resetCursor) => {
        logger.warn(easy_ansi_1.MCColor.c2c(msg), resetCursor);
    });
    commands_js_1.events.on('msg_error', (msg, resetCursor, err) => {
        logger.debugError(easy_ansi_1.MCColor.c2c(msg), resetCursor, err);
    });
    commands_js_1.events.on('msg_success', (msg, resetCursor) => {
        logger.success(easy_ansi_1.MCColor.c2c(msg), resetCursor);
    });
    return chat;
}
exports.makeChat = makeChat;
