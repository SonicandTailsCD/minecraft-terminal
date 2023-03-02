import { _package } from '../lib/helpers/package.js';
import { ParseArgs } from '../lib/parseArgs.js';
import { type Settings } from '../config/settings.js';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { filePath as configPathPath, configPath } from '../lib/helpers/configPath.js';

const parseArgs = new ParseArgs();

export function setOpts (settings: Settings): void {
	parseArgs.addopt(['--help', '-h'], 0, 'Show this help message.', () => {
		process.stdout.write(parseArgs.getHelp(_package.name));

		process.exit();
	});

	parseArgs.addopt(['--version', '-v'], 0, 'Show version information.', () => {
		process.stdout.write(`${_package.name} version: ${_package.version}\nNode version: ${process.version}\n`);
		process.exit();
	});

	parseArgs.addopt(['--debug'], 2, 'Enable debug mode.', (params: string[]) => {
		const stackTraceLimit = Number(params[1]);
		if (Number.isInteger(stackTraceLimit) || stackTraceLimit === Infinity) {
			Error.stackTraceLimit = stackTraceLimit;
		}
		settings.logging.debug = true;
	});

	parseArgs.addopt(['--set-conf-path', '-scp'], 2, 'Set the config folder path.', (params) => {
		let dir = params[1] || '';
		dir = resolve(dir);
		writeFileSync(configPathPath, dir, { encoding: 'utf8' });
		process.exit();
	});

	parseArgs.addopt(['--get-conf-path', '-gcp'], 0, 'Get the config folder path.', () => {
		process.stdout.write(configPath + '\n');
		process.exit();
	});

	// Do not use the ./config/credentials.toml file for credentials
	parseArgs.addopt(['--no-cred', '-nc'], 0, 'Do not use the credentials file.', () => {
		settings.config.enabled.cred = false;
	});

	// Do not use the ./config/config.toml file for configuration
	parseArgs.addopt(['--no-conf', '-ns'], 0, 'Use default config', () => {
		settings.config.enabled.config = false;
	});

	// Do not use the ./config/plugin.toml file for configuration
	parseArgs.addopt(['--no-plugins', '-np'], 0, 'Do not load plugins specified in plugins file.', () => {
		settings.config.enabled.plugins = false;
	});

	// Get credentials from CLI arguments
	parseArgs.addopt(['--cred', '-c'], 6, '<Auth> <Username> <Password> <Version> <Server>\nOverride credentials from CLI arguments.', (params) => {
		const credList: Array<keyof Settings['bot']['cred']> = [
			'auth',
			'username',
			'password',
			'server',
			'version'
		];
		for (let i = 1; i < params.length; i++) {
			const cred: keyof Settings['bot']['cred'] = credList[i - 1];
			if (params[i] !== '!') {
				if (params[i] !== undefined && params[i] !== '') {
					settings.bot.cred[cred] = params[i] as keyof object;
				}
			} else settings.bot.cred[cred] = null as keyof object;
		}
	});

	parseArgs.run();
}
