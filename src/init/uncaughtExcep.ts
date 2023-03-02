import { error, warn } from '../lib/log.js';
import { color } from 'easy-ansi';
import { _package } from '../lib/helpers/package.js';
import { type Settings } from '../config/settings.js';

export function setUncaughtExcep (settings: Settings): void {
	const onUncaughtException = (err: Error): void => {
		if (settings.logging.debug) {
			process.stderr.write(color.rgb(255, 80, 120) + (err.stack ?? err.message) + color.reset);
			return;
		}

		const stack = err.stack?.split('\n');
		const relevant = stack?.slice(1, 3).join('\n');
		err.message = err.message.split('\n')[0];
		error(`An unexpected error occurred.\n${err.message}${relevant ?? ''}`);
		if (_package.bugs?.url) warn(`Please open a bug report on github: ${_package.bugs.url}`);
		process.exit(1);
	};

	process.on('uncaughtException', onUncaughtException);
}
