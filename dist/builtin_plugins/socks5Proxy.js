"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.before = exports.name = void 0;
const tslib_1 = require("tslib");
const socks_1 = require("socks");
const proxy_agent_1 = tslib_1.__importDefault(require("proxy-agent"));
exports.name = 'Socks5 Proxy';
const before = (mcterm, settings) => {
    const proxySettings = settings.settings.config.config.plugins.settings.socks5Proxy;
    const minecraftHost = settings.options.host || 'localhost';
    const minecraftPort = settings.options.port ?? 25565;
    const proxyHost = proxySettings.host;
    const proxyPort = proxySettings.port;
    const proxyUsername = proxySettings.username || undefined;
    const proxyPassword = proxySettings.password || undefined;
    const stream = (client) => {
        void socks_1.SocksClient.createConnection({
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
    settings.options.agent = new proxy_agent_1.default({
        protocol: 'socks5:',
        host: proxyHost,
        port: proxyPort
    });
    mcterm.info(`Connecting with Socks5 proxy.\nhost: ${proxyHost}\nport: ${proxyPort}`);
};
exports.before = before;
