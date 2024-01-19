import { basename } from 'path';

export function displayName (path: string): string {
	return (basename(path).match(/^.+(?=\.)|.+/)!)[0];
}
