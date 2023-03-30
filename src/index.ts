#!/usr/bin/env node
/* eslint-disable import/first */
import { _package } from './lib/helpers/package.js';
process.title = _package.name;

import { Settings } from './config/settings.js';
import { setOpts } from './init/setOpts.js';

const settings = new Settings();
setOpts(settings);

import { info, error, setup as loggerSetup } from './lib/log.js';

info('Loading...', false);

import { load as loadConfig } from './init/loadConfig.js';
import { updateConfig } from './init/updateConfig.js';
import * as lang from './lang/translatable.js';

updateConfig();
Object.assign(settings.config.config, loadConfig(settings));

{
	const configLang = settings.config.config.config.language.toUpperCase();
	lang.languages[configLang]
		? lang.setLang(lang.languages[configLang])
		: error(`Invalid language set in configuration '${configLang}'.\nFalling back to default (EN)`);
}

info(lang.currentLang.data.misc.loading, false);

import { setUncaughtExcep as uncaughtExcep } from './init/uncaughtExcep.js';
import { setup as botSetup, botMain } from './lib/helpers/bot.js';
import { importTOML } from './lib/helpers/importTOML.js';
import { configPath } from './lib/helpers/configPath.js';
import { overrideCred } from './init/overrideCred.js';
import { promptCred } from './init/promptCred.js';
import { makeChat } from './init/makeChat.js';
import { commands } from './lib/commands.js';
import type { Chat } from 'basic-chat-cli';
import { join } from 'path';

overrideCred(settings);
uncaughtExcep(settings);

const chat: Chat = makeChat();
loggerSetup(chat, settings);

process.once('exit', () => {
	process.stdout.write('\n');
});

void (async () => {
	await promptCred(settings, chat.readline);

	const port = settings.bot.cred.server.match(/(?<=:)\d+/)?.[0];
	if (port !== undefined) {
		settings.bot.cred.server = settings.bot.cred.server.match(/^[^:]+/)?.[0] ?? 'localhost';
		settings.bot.cred.port = Number(port);
	}

	botSetup(chat, settings);
	await botMain();

	const tasksTOMLPath = join(configPath, 'tasks.toml');
	const tasks = importTOML(tasksTOMLPath) as Record<string, string>;
	commands.runTasks(tasks);
})();
