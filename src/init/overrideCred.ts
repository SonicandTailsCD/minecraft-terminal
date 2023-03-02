import { type Settings } from '../config/settings.js';

export function overrideCred (settings: Settings): void {
	const confCredKeys = Object.keys(settings.config.config.cred);
	const botCredKeys = Object.keys(settings.bot.cred);
	for (let i = 0; i < botCredKeys.length; i++) {
		const botCredValue = settings.bot.cred[botCredKeys[i] as keyof object];
		const confCredValue = settings.config.config.cred[confCredKeys[i] as keyof object];
		if (confCredValue === undefined || botCredValue !== undefined) {
			if (botCredValue !== '') {
				settings.bot.cred[botCredKeys[i] as keyof object] = botCredValue;
			}
		} else if (botCredValue === undefined) {
			if (confCredValue !== '') {
				settings.bot.cred[botCredKeys[i] as keyof object] = confCredValue;
			}
		}
	}
}
