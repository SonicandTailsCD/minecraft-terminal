import { basename } from 'path';

export function displayName (path: string): string {
	const m = basename(path).match(/^.+(?=\.)|.+/);
	if (m) {
		return m[0];
	}
	return '';
}
