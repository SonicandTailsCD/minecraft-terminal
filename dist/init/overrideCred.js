"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideCred = void 0;
function overrideCred(settings) {
    const confCredKeys = Object.keys(settings.config.config.cred);
    const botCredKeys = Object.keys(settings.bot.cred);
    for (let i = 0; i < botCredKeys.length; i++) {
        const botCredValue = settings.bot.cred[botCredKeys[i]];
        const confCredValue = settings.config.config.cred[confCredKeys[i]];
        if (confCredValue === undefined || botCredValue !== undefined) {
            if (botCredValue !== '') {
                settings.bot.cred[botCredKeys[i]] = botCredValue;
            }
        }
        else if (botCredValue === undefined) {
            if (confCredValue !== '') {
                settings.bot.cred[botCredKeys[i]] = confCredValue;
            }
        }
    }
}
exports.overrideCred = overrideCred;
