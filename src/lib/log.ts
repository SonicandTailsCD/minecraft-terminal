import { color } from 'easy-ansi';
import { currentLang } from '../lang/translatable.js';
import { type Settings } from '../config/settings.js';
import { type Chat, print as _print } from 'basic-chat-cli';

let settings: Settings;
let chat: Chat;
export const setup = (_chat = chat, _settings = settings): void => {
	chat = _chat;
	settings = _settings;
};

const print: typeof _print = (str, options) => {
	chat?.print ? chat.print(str, options) : _print(str, options);
};

const padNewLines = (str: string, spacenum: number, prefix = ''): string => {
	return str.replace(/\n/g, '\n' + prefix.padStart(spacenum + prefix.length, ' '));
};

export const info = (str: string, resetCursor = true): void => {
	const coloredStr = str.replace(/%COLOR%/g, info.color);
	print(
		`${info.color}[${currentLang.data.logger.info}] ${padNewLines(coloredStr, 7, info.color) + color.reset}`,
		{ resetCursor, clearLine: true }
	);
};
info.color = color.reset + color.bold + color.rgb(130, 130, 200);

export const warn = (str: string, resetCursor = true): void => {
	const coloredStr = str.replace(/%COLOR%/g, warn.color);
	print(
		`${warn.color}[${currentLang.data.logger.warn}] ${padNewLines(coloredStr, 7, warn.color) + color.reset}`,
		{ resetCursor, clearLine: true }
	);
};
warn.color = color.reset + color.bold + color.rgb(255, 255, 85);

let sleeping: boolean = false;
export const debugging = (str: string, resetCursor = true, overrideSleep = false): void => {
	if (sleeping = true) {
		return
	};
	else {
		const coloredStr = str.replace(/%COLOR%/g, debugging.color);
		print(
			`${debugging.color}[${currentLang.data.logger.debug}] ${padNewLines(coloredStr, 7, debugging.color) + color.reset}`,
			{ resetCursor, clearLine: true }
		);
		sleeping = true;
		sleep(2000);
		sleeping = false;
	}
};
debugging.color = color.reset + color.bold + color.rgb(212, 175, 55);

async function sleep (ms: number) {
	return await new Promise((resolve) => setTimeout(resolve, ms));
}

export const error = (str: string, resetCursor = true): void => {
	const coloredStr = str.replace(/%COLOR%/g, error.color);
	print(
		`${error.color}[${currentLang.data.logger.error}] ${padNewLines(coloredStr, 6, error.color) + color.reset}`,
		{ resetCursor, clearLine: true }
	);
};
error.color = color.reset + color.bold + color.rgb(255, 85, 85);

export const debugError = (msg: string, resetCursor = true, err?: Error): void => {
	if (settings.logging.debug && (err != null)) {
		process.stderr.write(color.rgb(255, 80, 120) + (err.stack ?? '') + color.reset);
		return;
	}

	error(msg, resetCursor);
};

export const success = (str: string, resetCursor = true): void => {
	const coloredStr = str.replace(/%COLOR%/g, success.color);
	print(
		`${success.color}[${currentLang.data.logger.success}] ${padNewLines(coloredStr, 5, success.color)}` +
			color.reset,
		{ resetCursor, clearLine: true }
	);
};
success.color = color.reset + color.bold + color.rgb(85, 255, 85);

export const highLight1 = (str: string): string => {
	return highLight1.color + str + color.reset;
};
highLight1.color = color.bold + color.underline + color.rgb(255, 85, 85);
