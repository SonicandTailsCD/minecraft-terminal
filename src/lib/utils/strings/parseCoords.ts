/**
 * Parses a string for coordinates and replaces any '~' characters with the
 * provided position. Numbers placed next to the '~' character will be added
 * to the corresponding coordinate.
 * @param {string} str - The string to parse.
 * @param {{x: number, y: number, z: number}} position - The position to use for replacing '~' characters.
 * @param {number} [fixed] - The number of decimal places to use for the replaced coordinates.
 * @return {string} The parsed string.
 *
 * @example
 * const str = 'teleport to ~10 ~ ~5';
 * const position = { x: 5, y: 0, z: 0 };
 * parseCoords(str, position); // returns 'teleport to 15 0 5'
 */
export function parseCoords (str: string, position: { x: number, y?: number, z?: number }, fixed?: number): string {
	let match = str.match(/[-~.+\d]+ [-~.+\d]+ [-~.+\d]*/g);
	if (match === null) {
		match = str.match(/[-~.+\d]+ [-~.+\d]*/g);
	}
	if (match === null) {
		return str;
	}
	for (let i = 0; i < match.length; i++) {
		const out = match[i].replace(/ $/, '');
		if (out === '~') {
			match[i] = '';
		} else {
			match[i] = out;
		}
	}
	if (typeof position !== 'object') {
		position = { x: 0, y: 0, z: 0 };
	}
	let outCoords = '';

	let outCommand = str;

	const parse = (match: string, matchRegex: RegExp, outr: string, matchReplaceRegex: RegExp, pos: string): string => {
		let out: number;
		const x = Number(match.match(matchRegex));
		if (fixed) out = Number((position[pos as keyof object] as number + (x || 0)).toFixed(fixed));
		else out = position.x + (x || 0);
		return outr.replace(matchReplaceRegex, String(out));
	};

	for (let i = 0; i < match.length; i++) {
		if (match[i].match('~') == null) {
			continue;
		}
		// Parse X
		outCoords = parse(match[i], /(?<=^~)[-.+\d]+/m, match[i], /^~[-.+\d]*/, 'x');

		// Parse Z
		outCoords = parse(match[i], /[-.+\d]+$/, outCoords, /~[-.+\d]*$/m, 'z');

		// Parse Y
		outCoords = parse(match[i], /(?<!^~)(?<=~)[-.+\d]+(?= )/, outCoords, /(?<= )~[-.+\d]*/, 'y');

		outCommand = outCommand.replace(match[i], outCoords);
	}
	return outCommand;
}
