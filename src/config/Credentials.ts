export class Credentials {
	public auth = '';
	public username = '';
	public password = '';
	public server = '';
	public version = '';

	constructor (options?: Partial<Credentials>) {
		Object.assign(this, options);
	}
}
