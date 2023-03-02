import { readFileSync, accessSync, constants as fsConstants } from 'fs';
import { type JsonMap, parse as parseTOML } from '@iarna/toml';

/**
 * Load and parse a TOML file.
 *
 * @param path The path to the config file.
 * @return A parsed toml file.
 */
export function importTOML (path: string): JsonMap {
	accessSync(path, fsConstants.F_OK);
	return parseTOML(readFileSync(path).toString());
}
