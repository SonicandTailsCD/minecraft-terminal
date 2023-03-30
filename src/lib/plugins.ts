import { existsSync } from 'fs';
import { type Settings } from '../config/settings';
import { displayName } from './utils/strings/index.js;
import * as ansi from 'easy-ansi';
import { print, info, warn, error, success, commands, reservedCommandNames, nonVanillaCommands, bot } from './commands.js';
import { type BotOptions } from 'mineflayer';

let ssettings: { settings: Settings, options: BotOptions };

export function setup (_settings: { settings: Settings, options: BotOptions }): void {
	ssettings = _settings;
}

export class PluginExportsBefore {
	public settings = ssettings;
	public ansi = ansi;
	public print = print;
	public info = info;
	public warn = warn;
	public error = error;
	public success = success;
}

export class PluginExports {
	public commands = commands;
	public reservedCommandNames = reservedCommandNames;
	public settings = ssettings;
	public nonVanillaCommands = nonVanillaCommands;
	public bot = bot;
	public ansi = ansi;
	public print = print;
	public info = info;
	public warn = warn;
	public error = error;
	public success = success;
}

export class Plugin {
	public readonly name: string;

	/*
	 Executes before the bot is created
	*/
	public readonly before: (
		(mcterm: PluginExportsBefore, settings: typeof ssettings) => void | Promise<void>
	) | undefined;

	/*
	 Executes after the bot is created
	*/
	public readonly main: ((mcterm: PluginExports, settings: typeof ssettings) => void) | undefined;

	constructor (options: { name: Plugin['name'], before?: Plugin['before'], main?: Plugin['main'] }) {
		Object.assign(this, options);
	}

	public async run (): Promise<void> {
		await this.before?.(new PluginExportsBefore(), ssettings);
		this.main?.(new PluginExports(), ssettings);
	}
}

export async function loadPlugin (pluginPath: string, runBefOnly = false): Promise<void> {
	if (pluginPath === '') {
		return;
	}

	let pluginName = displayName(pluginPath);

	if (!existsSync(pluginPath)) {
		if (!runBefOnly) warn(`Plugin '${pluginName}' not found.\nPath: '${pluginPath}'`);
		return;
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const pl = require(pluginPath);
		if (typeof pl.name === 'string') { pluginName = pl.name }
		const plugin = new Plugin({
			name: pluginName,
			main: pl.main,
			before: pl.before
		});

		if (runBefOnly) {
			await plugin.before?.(new PluginExportsBefore(), ssettings);
			return;
		}
		success(`Loaded plugin: '${pluginName}'`);

		plugin.main?.(new PluginExports(), ssettings);
	} catch (e) {
		const err: Error = e as Error;
		error(`An error occured with the plugin '${pluginName}'.\n${err.message}\nIf this keeps happening you may need to remove the plugin`, true, err);
	}
}
