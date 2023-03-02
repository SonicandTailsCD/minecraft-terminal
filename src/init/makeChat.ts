import * as logger from '../lib/log.js';
import { Chat } from 'basic-chat-cli';
import { MCColor } from 'easy-ansi';
import { events } from '../lib/commands.js';
import { setInterface as promptSetInterface } from '../lib/helpers/prompt.js';

export function makeChat (): Chat {
	const chat = new Chat({
		readLineOpts: {
			input: process.stdin,
			output: process.stdout,
			prompt: ''
		}
	});

	chat.readline.once('close', () => {
		process.stdout.write('\n');
		process.exit();
	});

	chat.events.on('msgReceived', ({ msg }) => {
		chat.print(msg);
	});

	chat.readline.on('line', () => {
		chat.readline.prompt(false);
	});

	promptSetInterface(chat.readline);

	events.on('msg', (msg, resetCursor) => {
		chat.print(MCColor.c2c(msg), { resetCursor });
	});
	events.on('msg_info', (msg, resetCursor) => {
		logger.info(MCColor.c2c(msg), resetCursor);
	});
	events.on('msg_warn', (msg, resetCursor) => {
		logger.warn(MCColor.c2c(msg), resetCursor);
	});
	events.on('msg_error', (msg, resetCursor, err) => {
		logger.debugError(MCColor.c2c(msg), resetCursor, err);
	});
	events.on('msg_success', (msg, resetCursor) => {
		logger.success(MCColor.c2c(msg), resetCursor);
	});

	return chat;
}
