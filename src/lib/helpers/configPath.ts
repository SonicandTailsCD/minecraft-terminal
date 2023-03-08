import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { srcPath } from './mainPath.js';
import { homedir } from 'os';
import { join } from 'path';
import { _package } from './package.js';

const defaultDir: string = process.platform === 'win32' ? join(process.env.APPDATA ?? homedir(), _package.name) : join(homedir(), '.config', _package.name);

/*
  Returns the file containing the config files' path's path
*/
export const filePath: string = join(defaultDir, '.configPath');

/*
  Returns config files' path
*/
function get (): string {
	if (!existsSync(filePath)) {
		mkdirSync(defaultDir, { recursive: true });
		writeFileSync(filePath, defaultDir);
		return defaultDir;
	}

	const fileContent = readFileSync(filePath, { encoding: 'utf8' });

	if (!fileContent) {
		writeFileSync(filePath, defaultDir);
		return defaultDir;
	}

	return fileContent;
}

export const configPath = get();

export const builtinPluginsPath = join(srcPath, 'builtin_plugins');
