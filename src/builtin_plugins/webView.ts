// @ts-nocheck

import { mineflayer as mineflayerViewer } from 'prismarine-viewer';
import { color } from 'easy-ansi';
import { type PluginExports } from '../lib/commands.js';
import { type Settings } from '../config/settings.js';
import { type BotOptions } from 'mineflayer';

export const name = 'Web View';

export const main = (mcterm: PluginExports, settings: { settings: Settings, options: BotOptions }): void => {
	const webViewSettings = settings.settings.config.config.plugins.settings.webView;
	mcterm.bot.once('spawn', () => {
		mineflayerViewer(
			mcterm.bot, {
				port: webViewSettings.port as string,
				version: mcterm.bot.version,
				firstPerson: webViewSettings.firstPerson as boolean
			}
		); // Start the viewing server on port 3000
		mcterm.info(`Web viewer running on port ${color.rgb(10, 100, 250) + color.italic}https://localhost:${webViewSettings.port as string + color.reset}%COLOR%`);

		// Draw the path followed by the bot
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
