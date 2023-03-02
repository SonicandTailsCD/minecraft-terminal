import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { mod } from './lib/editPkgExe.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _package = require('../package.json');

function getExeFromBuildDir (dir = '../builds'): string[] | null {
	const files = readdirSync(dir, { encoding: 'utf8' });

	const out: string[] = [];
	for (const val of files) {
		if (/\.exe$/.test(val)) {
			out.push(resolve(join(dir, val)));
		}
	}

	return out[0] ? out : null;
}

// Mod
{
	const filePath = getExeFromBuildDir(join(__dirname, '..', 'builds'))?.[0];

	if (filePath) {
		mod({
			file: filePath,
			out: `${filePath}-mod.exe`,
			version: _package.version as `${number}.${number}.${number}`,
			properties: {
				FileDescription: _package.description,
				ProductName: _package.name,
				CompanyName: '',
				LegalCopyright: ''
			}

		});
		process.stdout.write('Done.\n');
	} else {
		process.stderr.write('EXE file not found.\n');
	}
}
