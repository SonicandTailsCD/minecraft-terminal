"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUncaughtExcep = void 0;
const log_js_1 = require("../lib/log.js");
const easy_ansi_1 = require("easy-ansi");
const package_js_1 = require("../lib/helpers/package.js");
function setUncaughtExcep(settings) {
    const onUncaughtException = (err) => {
        if (settings.logging.debug) {
            process.stderr.write(easy_ansi_1.color.rgb(255, 80, 120) + (err.stack ?? err.message) + easy_ansi_1.color.reset);
            return;
        }
        const stack = err.stack?.split('\n');
        const relevant = stack?.slice(1, 3).join('\n');
        err.message = err.message.split('\n')[0];
        (0, log_js_1.error)(`An unexpected error occurred.\n${err.message}${relevant ?? ''}`);
        if (package_js_1._package.bugs?.url)
            (0, log_js_1.warn)(`Please open a bug report on github: ${package_js_1._package.bugs.url}`);
        process.exit(1);
    };
    process.on('uncaughtException', onUncaughtException);
}
exports.setUncaughtExcep = setUncaughtExcep;
