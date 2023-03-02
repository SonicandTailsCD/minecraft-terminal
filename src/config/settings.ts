import { Config } from './Config.js';
import { Plugins } from './Plugins.js';

export interface BotCredentials {
	auth: 'mojang' | 'microsoft' | 'offline' | ''
	username: string
	password?: string
	server: string
	version: string
	port: number
}

export interface EnabledSettings {
	cred: boolean
	config: boolean
	plugins: boolean
	physics: boolean
}

export interface ConfigSettings {
	cred: object
	config: Config
	plugins: Plugins
	physics: object
}

export interface LoggingSettings {
	debug: boolean
}

export class Settings {
	public logging: LoggingSettings = { debug: false };
	public bot: { cred: BotCredentials } = {
		cred: {
			auth: '',
			username: '',
			password: undefined,
			server: '',
			version: '',
			port: 25565
		}
	};

	public config: {
		enabled: EnabledSettings
		config: ConfigSettings
	} = {
			enabled: {
				cred: true,
				config: true,
				plugins: true,
				physics: false
			},
			config: {
				cred: {},
				config: new Config(),
				plugins: new Plugins(),
				physics: {}
			}
		};

	constructor (options?: Partial<Settings>) {
		if (options) Object.assign(this, options);
	}
}
