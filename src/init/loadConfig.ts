import { error, warn, info, highLight1 } from '../lib/log.js';
import { importTOML } from '../lib/helpers/importTOML.js';
import { join } from 'path';
import { configPath } from '../lib/helpers/configPath.js';
import { type Settings } from '../config/settings.js';
import { type Config } from '../config/Config.js';
import { type Plugins } from '../config/Plugins.js';
import { type JsonMap } from '@iarna/toml/index.js';

const readErr = (file: string, errorMsg?: string): never => {
	if (errorMsg) {
		error(`An error occurred while trying to read ${file}.\n${errorMsg}`);
	} else {
		error(`An error occurred while trying to read ${file}`);
	}
	process.exit(1);
};

function loadTOMLFile (name: string): JsonMap {
	try {
		return importTOML(join(configPath, name));
	} catch (err) {
		return readErr(name, (err as { message: string }).message);
	}
}

interface LoadedConfig {
	plugins?: Settings['config']['config']['plugins']
	config?: Settings['config']['config']['config']
	physics?: Settings['config']['config']['physics']
	cred?: Settings['config']['config']['cred']
}

export function load (settings: Settings): LoadedConfig {
	const config: LoadedConfig = {};
	if (settings.config.enabled.plugins) {
		config.plugins = loadTOMLFile('plugins.toml') as unknown as Plugins;
	} else {
		warn('Not using plugins');
	}

	if (settings.config.enabled.config) {
		config.config = loadTOMLFile('config.toml') as unknown as (Config | undefined);
	} else {
		warn('Using default config');
	}

	let physics;
	try {
		physics = importTOML(`${configPath}/physics.toml`);
		if (physics.usePhysicsConfig === true) {
			warn(`Using custom physics. this will result in a ${highLight1('ban')}%COLOR% in most servers!`);
			info('You can disable it by editing usePhysicsConfig in physics.toml');
			settings.config.enabled.physics = true;
			delete physics.usePhysicsConfig;
			config.physics = physics;
		}
	} catch (err) {
		readErr('physics.toml', (err as { message: string }).message);
	}

	if (settings.config.enabled.cred) {
		try {
			config.cred = {
				...{
					auth: undefined,
					username: undefined,
					password: undefined,
					server: undefined,
					version: undefined
				},
				...importTOML(join(configPath, 'credentials.toml'))
			};
		} catch (err) {
			readErr('credentials.toml', (err as { message: string }).message);
		}
	}

	return config;
}
