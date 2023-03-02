import { type ReadLine } from 'readline';

let rlInterface: ReadLine;
export function setInterface (int: ReadLine): void {
	rlInterface = int;
}

export async function prompt (query: string): Promise<string> {
	return await new Promise((resolve) => { rlInterface.question(query, resolve) });
}
