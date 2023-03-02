import { configPath } from '../lib/helpers/configPath.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { onlyKeepKeys } from '../lib/utils/other/onlyKeepKeys.js';
import { Config } from '../config/Config.js';
import { Plugins } from '../config/Plugins.js';
import { Tasks } from '../config/Tasks.js';
import { Physics } from '../config/Physics.js';
import { Credentials } from '../config/Credentials.js';
import * as logger from '../lib/log.js';
import { mergeObjects } from '../lib/utils/other/merge.js';
import TOML from '@iarna/toml';
import { join } from 'path';

function modify (fileName: string, data: object, _default: object): typeof data {
	const remove = Object.assign({}, _default);

	if (fileName === 'plugins.toml') {
		mergeObjects(remove, {
			settings: (data as Plugins).settings
		},
		{
			mutate: true,
			typeCheck: true,
			typeCheckUndefined: false
		});
	}
	if (fileName === 'config.toml') {
		mergeObjects(remove, {
			commands: {
				commandAliases: (data as Config).commands.commandAliases
			}
		},
		{
			mutate: true,
			typeCheck: true,
			typeCheckUndefined: false
		});
	}
	if (fileName !== 'tasks.toml') {
		data = onlyKeepKeys(data, remove);
	}

	const add: object = Object.assign({}, _default);
	if (fileName === 'config.toml') {
		(add as Config).commands.commandAliases = {};
	}
	return mergeObjects(add, data, { typeCheck: true, typeCheckUndefined: false }) as unknown as object;
}

export function updateConfig (): void {
	const fileToCl = {
		'config.toml': Config,
		'credentials.toml': Credentials,
		'physics.toml': Physics,
		'plugins.toml': Plugins,
		'tasks.toml': Tasks
	};

	const validConfigFileNames = Object.keys(fileToCl);

	if (!existsSync(configPath)) {
		mkdirSync(configPath, { recursive: true });
	}

	validConfigFileNames.forEach(fileName => {
		if (!validConfigFileNames.includes(fileName)) {
			return;
		}

		const filePath = join(configPath, fileName);

		let out;
		try {
			const defaultData = new (fileToCl[fileName as keyof object] as typeof Config)();

			let fileData: string;
			if (existsSync(filePath)) {
				fileData = readFileSync(filePath, { encoding: 'utf8' });
				const parsedFile = TOML.parse(fileData);

				out = modify(fileName, parsedFile, defaultData);
			} else {
				out = defaultData;
			}

			out = TOML.stringify(out as TOML.JsonMap).replace(/ {2}/g, '\t');
		} catch (err) {
			logger.debugError('An error occurred while trying to parse ' +
				`${fileName}.\n${(err as Error).message}`, true, err);

			process.exit(1);
		}

		try {
			writeFileSync(filePath, out, 'utf-8');
		} catch (err) {
			logger.debugError('An error occurred while trying to update ' +
				`${fileName}.\n${(err as Error).message}`, true, err);
		}
	});
}
