export class CommandLang {
	constructor (options?: Partial<CommandLang>) {
		Object.assign(this, options);
	}

	description?: string;
	usage?: string;
	subCommands?: Record<string, CommandLang>;
}
