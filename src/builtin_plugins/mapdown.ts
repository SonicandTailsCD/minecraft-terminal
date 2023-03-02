// @ts-nocheck

import mineflayerMaps, { parseASCII } from 'mineflayer-maps';
import { cursor } from 'easy-ansi';
import { type PluginExports } from '../lib/commands.js';
import { type BotEvents } from 'mineflayer';

export const name = 'Map Downloader';

export const main = async (mcterm: PluginExports): Promise<void> => {
	mcterm.bot.loadPlugin(mineflayerMaps);
	mcterm.bot.maps.outputDir = './maps';

	mcterm.info('Added \'.mapSave\' and \'.mapPreview\' commands');
	mcterm.commands.commands.mapSave = (state) => {
		if (typeof state !== 'boolean') {
			mcterm.info('Usage: .mapSave <State: true|false>');
			return;
		}
		mcterm.bot.maps.setSaveToFile(state);
		mcterm.success('Updated');
	};
	mcterm.commands.commands.mapPreview = (state) => {
		if (typeof state !== 'boolean') {
			mcterm.info('Usage: .mapPreview <State: true|false>');
			return;
		}
		if (state) {
			if (mcterm.bot.listeners.includes(onMapPreview)) {
				mcterm.bot._client.on('map', onMapPreview);
			}
		} else {
			mcterm.bot._client.off('map', onMapPreview);
		}
		mcterm.success('Updated');
	};

	const onMap = (map): void => {
		mcterm.success(`Saved map at:\n${map.fullPath as string}`);
	};

	mcterm.bot.on('new_map_saved' as keyof BotEvents, onMap);

	const onMapPreview = ({ map }): void => {
		try {
			const termSize = cursor.termSize();
			const div = Math.floor(128 / (Math.min(termSize[0], termSize[1] / 2) * 2));
			mcterm.success('Map preview:');
			mcterm.print(parseASCII(map, false, div));
		} catch {
			mcterm.error('An error occurred while trying to preview map');
		}
	};
	mcterm.bot.on('new_map' as keyof BotEvents, onMapPreview);
};
