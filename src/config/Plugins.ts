import { builtinPluginsPath } from '../lib/helpers/configPath.js';
import { displayName } from '../lib/utils/strings';
import { readdirSync } from 'fs';

export class Plugins {
	// Array of user defined plugin paths
	public user: string[] = [];

	// Enable builtin plugins
	public builtin: Record<string, boolean> = {};

	// Settings for plugins
	public settings: Record<string, Record<string, unknown>> = {};

	constructor (options?: Partial<Plugins>) {
		Object.assign(this, options);
		const pluginNames: string[] = [];
		for (const val of readdirSync(builtinPluginsPath)) {
			pluginNames.push(displayName(val));
		}

		const pluginEnable: Record<string, boolean> = {};
		for (const val of pluginNames) {
			pluginEnable[val] = false;
		}

		const pluginSettings: Record<string, object> = {
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
