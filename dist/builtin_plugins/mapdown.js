"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.name = void 0;
const tslib_1 = require("tslib");
const mineflayer_maps_1 = tslib_1.__importStar(require("mineflayer-maps"));
const easy_ansi_1 = require("easy-ansi");
exports.name = 'Map Downloader';
const main = async (mcterm) => {
    mcterm.bot.loadPlugin(mineflayer_maps_1.default);
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
        }
        else {
            mcterm.bot._client.off('map', onMapPreview);
        }
        mcterm.success('Updated');
    };
    const onMap = (map) => {
        mcterm.success(`Saved map at:\n${map.fullPath}`);
    };
    mcterm.bot.on('new_map_saved', onMap);
    const onMapPreview = ({ map }) => {
        try {
            const termSize = easy_ansi_1.cursor.termSize();
            const div = Math.floor(128 / (Math.min(termSize[0], termSize[1] / 2) * 2));
            mcterm.success('Map preview:');
            mcterm.print((0, mineflayer_maps_1.parseASCII)(map, false, div));
        }
        catch {
            mcterm.error('An error occurred while trying to preview map');
        }
    };
    mcterm.bot.on('new_map', onMapPreview);
};
exports.main = main;
