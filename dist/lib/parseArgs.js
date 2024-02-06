"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseArgs = void 0;
class Option {
    flags;
    numpar;
    description;
    callback;
    constructor(flags, numpar = 0, description, callback) {
        this.flags = flags;
        this.numpar = numpar;
        this.description = description;
        this.callback = callback;
    }
}
class ParseArgs {
    opts = [];
    addopt(flags, numpar = 0, description, callback) {
        this.opts.push(new Option(flags, numpar, description, callback));
    }
    getHelp(commandName, positionalArgs) {
        let out = '';
        const getCMD = (commandName) => {
            let out = '';
            out += `Usage: ${commandName}`;
            if (this.opts.length > 0) {
                out += ' [OPTIONS]';
            }
            if (positionalArgs != null) {
                for (const el of positionalArgs) {
                    out += ` <${el}>`;
                }
            }
            return out;
        };
        const getOptions = () => {
            let out = '';
            let maxDist = 0;
            const flagStrs = [];
            for (const el of this.opts) {
                const str = el.flags.join(', ');
                flagStrs.push(str);
                if (maxDist < str.length) {
                    maxDist = str.length;
                }
            }
            for (let i = 0; i < this.opts.length; i++) {
                out += '  ' + flagStrs[i].padEnd(maxDist + 4) + this.opts[i].description.split('\n').join('\n'.padEnd(maxDist + 7)) + '\n';
            }
            return out;
        };
        out = getCMD(commandName);
        out += '\n';
        out += getOptions();
        return out;
    }
    run() {
        const args = process.argv.slice(2);
        for (let a = 0; a < args.length; a++) {
            for (const opt of this.opts) {
                for (const flag of opt.flags) {
                    if (flag === args[a]) {
                        opt.callback(args.slice(a, opt.numpar + a));
                    }
                }
            }
        }
    }
}
exports.ParseArgs = ParseArgs;
