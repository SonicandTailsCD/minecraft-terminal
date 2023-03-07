#!/usr/bin/env node
/* eslint-disable import/first */
import { _package } from './lib/helpers/package.js';
process.title = _package.name;

import { load as loadConfig } from './init/loadConfig.js';
import { updateConfig } from './init/updateConfig.js';
import { Settings } from './config/settings.js';
import * as lang from './lang/translatable.js';
import { makeChat } from './init/makeChat.js';
import { setOpts } from './init/setOpts.js';
import { type Chat } from 'basic-chat-cli';
import * as logger from './lib/log.js';

// Set global settings
const settings = new Settings();

// Parse cmd args
setOpts(settings);

// Setup chat and input
const chat: Chat = makeChat();
logger.setup(chat, settings);

// Generate and update config files
updateConfig();

// Load config
Object.assign(settings.config.config, loadConfig(settings));

// Set language
{
	const configLang = settings.config.config.config.language.toUpperCase();

	if (Object.keys(lang.languages).includes(configLang)) {
		lang.setLang(lang.languages[configLang as keyof object]);
	} else {
		logger.error(`Invalid language set in configuration '${configLang}'.\nFalling back to default (EN)`);
	}
}

logger.info(lang.currentLang.data.misc.loading, false);

import { setUncaughtExcep as uncaughtExcep } from './init/uncaughtExcep.js';
import { setup as botMainSetup, botMain } from './lib/helpers/botMain.js';
import { importTOML } from './lib/helpers/importTOML.js';
import { configPath } from './lib/helpers/configPath.js';
import { overrideCred } from './init/overrideCred.js';
import { promptCred } from './init/promptCred.js';
import { commands } from './lib/commands.js';
import { join } from 'path';

// Override credentials
overrideCred(settings);

// Set uncaught exception message
uncaughtExcep(settings);

process.once('exit', () => {
	process.stdout.write('\n');
});

void (
	async () => {
		// Prompt for credentials and modify them
		await promptCred(settings, chat.readline);

		// set the port
		const port = settings.bot.cred.server.match(/(?<=:)\d+/)?.[0];
		if (port !== undefined) {
			// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
			settings.bot.cred.server = settings.bot.cred.server.match(/^[^:]+/)?.[0] || 'localhost';
			settings.bot.cred.port = Number(port);
		}

		// Start the bot
		botMainSetup(chat, settings);
		await botMain();

		// Run command tasks
		const tasksTOMLPath = join(configPath, 'tasks.toml');
		const tasks = importTOML(tasksTOMLPath) as Record<string, string>;
		commands.runTasks(tasks);
	}
)();
