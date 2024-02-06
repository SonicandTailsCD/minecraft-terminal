"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.name = void 0;
const prismarine_viewer_1 = require("prismarine-viewer");
const easy_ansi_1 = require("easy-ansi");
exports.name = 'Web View';
const main = (mcterm, settings) => {
    const webViewSettings = settings.settings.config.config.plugins.settings.webView;
    mcterm.bot.once('spawn', () => {
        (0, prismarine_viewer_1.mineflayer)(mcterm.bot, {
            port: webViewSettings.port,
            version: mcterm.bot.version,
            firstPerson: webViewSettings.firstPerson
        });
        mcterm.info(`Web viewer running on port ${easy_ansi_1.color.rgb(10, 100, 250) + easy_ansi_1.color.italic}https://localhost:${webViewSettings.port + easy_ansi_1.color.reset}%COLOR%`);
        if (webViewSettings.showTrail === true) {
            const path = [mcterm.bot.entity.position.clone()];
            mcterm.bot.on('move', () => {
                if (path[path.length - 1].distanceTo(mcterm.bot.entity.position) > 1) {
                    path.push(mcterm.bot.entity.position.clone());
                    mcterm.bot.viewer.drawLine('path', path);
                }
            });
        }
    });
};
exports.main = main;
