/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { SocksClient as Socks } from 'socks';
import ProxyAgent from 'proxy-agent';
import { type PluginExportsBefore } from '../lib/commands.js';
import { type AgentOptions } from 'http';
import { type Client } from 'minecraft-protocol';
import { type Settings } from '../config/settings.js';
import { type BotOptions } from 'mineflayer';

export const name = 'Socks5 Proxy';

export const before = (mcterm: PluginExportsBefore, settings: { settings: Settings, options: BotOptions }): void => {
	const proxySettings = settings.settings.config.config.plugins.settings.socks5Proxy as {
		host: string
		port: number
		username: string | undefined
		password: string | undefined
	};
	const minecraftHost = settings.options.host || 'localhost';
	const minecraftPort = settings.options.port ?? 25565;
	const proxyHost = proxySettings.host;
	const proxyPort = proxySettings.port;
	const proxyUsername = proxySettings.username || undefined;
	const proxyPassword = proxySettings.password || undefined;
	const stream = (client: Client): void => {
		void Socks.createConnection({
			proxy: {
				host: proxyHost,
				port: proxyPort,
				userId: proxyUsername,
				password: proxyPassword,
				type: 5
			},
			command: 'connect',
			destination: {
				host: minecraftHost,
				port: minecraftPort
			}
		}, (err, info) => {
			if ((err != null) || (info == null)) {
				mcterm.error(`Proxy: ${err?.message || 'Unknown Error'}`);
				process.exit();
			}
			client.setSocket(info.socket);
			client.emit('connect');
		});
	};
	delete settings.options.host;
	delete settings.options.port;
	settings.options.connect = stream;
	settings.options.agent = new ProxyAgent({
		protocol: 'socks5:',
		host: proxyHost,
		port: proxyPort
	} as unknown as AgentOptions);

	mcterm.info(`Connecting with Socks5 proxy.\nhost: ${proxyHost}\nport: ${proxyPort}`);
};
