import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { mainPath, srcPath } from './mainPath.js';
import { homedir } from 'os';
import { join } from 'path';

const dir: string = process.platform === 'win32' ? join(mainPath, 'config') : join(homedir(), '.config', 'mc-term');

/*
  Returns the file containing the config files' path's path
*/
export const filePath: string = join(dir, '.configPath');

/*
  Returns config files' path
*/
function get (): string {
	if (!existsSync(filePath)) {
		mkdirSync(dir, { recursive: true });
		writeFileSync(filePath, dir);
	}
	return readFileSync(filePath, { encoding: 'utf8' });
}

export const configPath = get();

export const builtinPluginsPath = join(srcPath, 'builtin_plugins');
