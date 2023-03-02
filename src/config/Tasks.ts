import { Task } from '../types/Task.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Tasks {
	[key: Task['name']]: Task['cmd'];

	constructor (options?: Partial<Tasks>) {
		Object.assign(this, options);
	}
}
