"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptCred = void 0;
const log_js_1 = require("../lib/log.js");
const prompt_js_1 = require("../lib/helpers/prompt.js");
const translatable_js_1 = require("../lang/translatable.js");
async function promptCred(settings, chat) {
    (0, prompt_js_1.setInterface)(chat);
    const promptIfUndef = async (varr, promptt, callback) => {
        if (!varr && varr !== null) {
            const input = (await (0, prompt_js_1.prompt)(promptt)).toLowerCase();
            callback(input);
        }
    };
    await promptIfUndef(settings.bot.cred.auth, translatable_js_1.currentLang.data.login.auth, (input) => {
        if (input === 'mojang') {
            (0, log_js_1.warn)('Mojang auth servers no longer accept mojang accounts to login.\nThat means you can no longer use mojang accounts');
            process.exit(1);
        }
        if (input !== 'microsoft') {
            input = 'offline';
        }
        settings.bot.cred.auth = input;
    });
    await promptIfUndef(settings.bot.cred.username, translatable_js_1.currentLang.data.login.username, (input) => {
        if (settings.bot.cred.auth === 'microsoft' && !input) {
            (0, log_js_1.warn)('When using a Microsoft auth you must specify a password and username');
            process.exit(1);
        }
        settings.bot.cred.username = input;
    });
    if (settings.bot.cred.auth === 'microsoft') {
        await promptIfUndef(settings.bot.cred.password, translatable_js_1.currentLang.data.login.password, (input) => {
            if (!input) {
                (0, log_js_1.warn)('When using a Microsoft auth you must specify a password and username');
                process.exit(1);
            }
            settings.bot.cred.password = input;
        });
    }
    await promptIfUndef(settings.bot.cred.server, translatable_js_1.currentLang.data.login.serverIP, (input) => {
        settings.bot.cred.server = input;
    });
    await promptIfUndef(settings.bot.cred.version, translatable_js_1.currentLang.data.login.MCVersion, (input) => {
        settings.bot.cred.version = input;
    });
    settings.bot.cred.username = settings.bot.cred.username || 'Player123';
    settings.bot.cred.password = settings.bot.cred.password ?? '';
    settings.bot.cred.server = settings.bot.cred.server || 'localhost';
    settings.bot.cred.version = settings.bot.cred.version || '1.12.2';
    settings.bot.cred.port = settings.bot.cred.port || 25565;
}
exports.promptCred = promptCred;
