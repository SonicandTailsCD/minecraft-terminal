class Option {
	public flags: string[];
	public numpar: number;
	public description: string;
	public callback: (params: string[]) => void;

	constructor (flags: string[], numpar = 0, description: string, callback: (params: string[]) => void) {
		this.flags = flags;
		this.numpar = numpar;
		this.description = description;
		this.callback = callback;
	}
}

export class ParseArgs {
	public opts: Option[] = [];

	public addopt (flags: string[], numpar = 0, description: string, callback: (params: string[]) => void): void {
		this.opts.push(new Option(flags, numpar, description, callback));
	}

	public getHelp (commandName: string, positionalArgs?: string[]): string {
		let out = '';
		const getCMD = (commandName: string): string => {
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

		const getOptions = (): string => {
			let out = '';

			let maxDist = 0;

			// Get the max possible distance between flag and desc
			const flagStrs: string[] = [];
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

	run (): void {
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
