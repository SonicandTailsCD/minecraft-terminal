export class Task {
	constructor (times: 'on' | 'once', eventName: string, cmd: string) {
		this.times = times;
		this.event = eventName;
		this.cmd = cmd;
		this.name = times + '_' + eventName;
	}

	times: 'on' | 'once';
	event: string;
	cmd: string;
	name: string;
}
