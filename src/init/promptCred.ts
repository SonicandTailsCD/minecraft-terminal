import { warn } from '../lib/log.js';
import { setInterface, prompt } from '../lib/helpers/prompt.js';
import { type Settings } from '../config/settings.js';
import { type Interface } from 'readline';
import { currentLang } from '../lang/translatable.js';

export async function promptCred (settings: Settings, chat: Interface): Promise<void> {
	setInterface(chat);

	const promptIfUndef = async (varr: string | undefined, promptt: string, callback: (input: string) => void): Promise<void> => {
		if (!varr && varr !== null) {
			const input = (await prompt(promptt)).toLowerCase();
			callback(input);
		}
	};

	await promptIfUndef(settings.bot.cred.auth, currentLang.data.login.auth, (input) => {
		if (input === 'mojang') {
			warn('Mojang auth servers no longer accept mojang accounts to login.\nThat means you can no longer use mojang accounts');
			process.exit(1);
		}

		if (input !== 'microsoft') {
			input = 'offline';
		}
		settings.bot.cred.auth = input as 'mojang' | 'microsoft' | 'offline';
	});

	await promptIfUndef(settings.bot.cred.username, currentLang.data.login.username, (input) => {
		if (settings.bot.cred.auth === 'microsoft' && !input) {
			warn('When using a Microsoft auth you must specify a password and username');
			process.exit(1);
		}
		settings.bot.cred.username = input;
	});

	if (settings.bot.cred.auth === 'microsoft') {
		await promptIfUndef(settings.bot.cred.password, currentLang.data.login.password, (input) => {
			if (!input) {
				warn('When using a Microsoft auth you must specify a password and username');
				process.exit(1);
			}
			settings.bot.cred.password = input;
		});
	}

	await promptIfUndef(settings.bot.cred.server, currentLang.data.login.serverIP, (input) => {
		settings.bot.cred.server = input;
	});

	await promptIfUndef(settings.bot.cred.version, currentLang.data.login.MCVersion, (input) => {
		settings.bot.cred.version = input;
	});

	// Set default values
	settings.bot.cred.username = settings.bot.cred.username || 'Player123';
	settings.bot.cred.password = settings.bot.cred.password ?? '';
	settings.bot.cred.server = settings.bot.cred.server || 'localhost';
	settings.bot.cred.version = settings.bot.cred.version || '1.12.2';
	settings.bot.cred.port = settings.bot.cred.port || 25565;
}
