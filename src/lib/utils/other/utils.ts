import { logicExp } from '../../logicExp.js';
import { escapeRegExp as escapeRegex } from '../strings/index.js;
import { isPlainObject } from 'merge';
import { isNumber } from '../numbers/isNumber.js';

/**
 * The parseVar function takes a string and replaces all instances of variables with their values.
 * Variables are defined as strings that start with the varPrefix option and end with the varSuffix option.
 * The default options for these are '%' for both, so an example variable would be %variable%.
 * If you want to use a different prefix or suffix, you can change them in the options object passed into parseVar.
 *
 * @example parseVar('Hello %name%!', { name: 'Bob' }, { varPrefix: '%', varSuffix: '%' }) // Returns 'Hello Bob!';,
 * @param {string} str The string to be parsed.
 * @param {object} variablesObj The variables in the string.
 * @param {object} [options]
 * @param {string} [options.varPrefix]
 * @param {string} [options.varSuffix]
 * @param {string} [options.undefinedVar] String to replace all undefined variables
 * @return A string with the variables parsed.
 */
export function parseVar (str: string, variablesObj: object, options?: { varPrefix?: string, varSuffix?: string, undefinedVar?: string }): string {
	options = Object.assign({
		varPrefix: '%',
		varSuffix: '%',
		undefinedVar: 'undefined'
	}, options);

	// Parse the variables
	const varPrefixRegex = escapeRegex(options.varPrefix as string);
	const varSuffixRegex = escapeRegex(options.varSuffix as string);
	let out = str.valueOf();
	Object.keys(variablesObj).forEach((value) => {
		out = out.replace(new RegExp(varPrefixRegex + escapeRegex(value) + varSuffixRegex, 'g'), variablesObj[value as keyof object]);
	});

	// Replaces everything else that isn't inside the variablesObj with undefinedVar
	out = out.replace(new RegExp(`${varPrefixRegex}[^${varSuffixRegex}]+${varSuffixRegex}`, 'g'), options.undefinedVar as string);
	return out;
}

export const parseStr = {
	/**
	 * Takes a string and returns the appropriate JavaScript type.
	 * @param {string} str The string to be parsed
	 * @return {string | number | boolean | null | undefined} A string, number, boolean, null or undefined.
	 */
	parse: (str: string, caseSensitive = true): string | number | boolean | null | undefined => {
		if (isNumber(Number(str))) {
			return Number(str);
		}

		// If the string only contains whitespaces return an empty string
		if (str.match(/^\s+$/) != null) {
			return '';
		}

		let out = str.valueOf();
		if (!caseSensitive) {
			out = out.toLowerCase();
		}

		if (out === 'false') {
			return false;
		}
		if (out === 'true') {
			return true;
		}
		if (out === 'null') {
			return null;
		}
		if (out === 'undefined') {
			return undefined;
		}

		return out;
	},
	/**
	 * The parseArr function takes an array of strings and returns an array of objects.
	 *
	 * @param {string[]} strArr Used to Pass in an array of strings.
	 * @param {boolean} [options.caseSensitive] Used to Set the default value of casesensitive to true.
	 * @return {Array<string | number | boolean | null | undefined>} An array of objects.
	 */
	parseArr: (strArr: string[], options = { caseSensitive: true }): Array<string | number | boolean | null | undefined> => {
		const out: Array<string | number | boolean | null | undefined> = [];

		let a = 0;
		strArr.forEach((value, index) => {
			out[a++] = parseStr.parse(strArr[index], options.caseSensitive);
		});

		return out;
	}
};

export function toLowerCaseArr (arr: string[]): string[] {
	const out: string[] = [];
	for (let i = 0; i < arr.length; i++) {
		const element = arr[i];
		out[i] = element.toLowerCase?.() || element;
	}
	return out;
}

export function matchEq (str: string, valObj: object): boolean {
	let strCopy = String(str.valueOf());
	const matches = str.split(/[&|]/);
	for (let i = 0; i < matches?.length; i++) {
		const mat = matches[i];
		const op = mat.match(/=|!=/)?.[0] ?? '';
		let bef = mat.match(new RegExp(`^[^${op}]+(?=${op})`))?.[0];
		let af = mat.match(new RegExp(`(?<=${op})[^${op}]+`))?.[0];

		if (bef && bef.charAt(0) === '$') {
			bef = valObj[bef.slice(1) as keyof object];
		}
		if (af && af.charAt(0) === '$') {
			af = valObj[af.slice(1) as keyof object];
		}

		let out = true;

		// eslint-disable-next-line eqeqeq
		if (op === '=' && bef?.toLowerCase?.() != af?.toLowerCase?.()) {
			out = false;
			// eslint-disable-next-line eqeqeq
		} else if (op === '!=' && bef?.toLowerCase?.() == af?.toLowerCase?.()) {
			out = false;
		}

		strCopy = strCopy.replace(mat, String(out));
	}
	return logicExp(strCopy, {}, { assumeVal: true });
}

export function shallowCompareObj (obj1: object | unknown[], obj2: object | unknown[]): boolean {
	const plainObj = isPlainObject(obj1);
	if (plainObj !== isPlainObject(obj2)) {
		return false;
	}

	if (plainObj) {
		const obj1Keys = Object.keys(obj1);
		for (let i = 0; i < obj1Keys.length; i++) {
			const key = obj1Keys[i];
			const obj1Val = (obj1 as [])[key as keyof object];
			const obj2Val = (obj2 as [])[key as keyof object];
			if ((obj1Val !== obj2Val) && (!['object', 'function'].includes(typeof obj1Val) || !['object', 'function'].includes(typeof obj2Val))) {
				return false;
			}
		}
		return true;
	}

	if ((obj1 as []).length !== (obj2 as []).length) {
		return false;
	}

	for (let i = 0; i < (obj1 as []).length; i++) {
		const obj1Val = (obj1 as [])[i];
		const obj2Val = (obj2 as [])[i];
		if ((obj1Val !== obj2Val) && (!['object', 'function'].includes(typeof obj1Val) || !['object', 'function'].includes(typeof obj2Val))) {
			return false;
		}
	}
	return true;
}

// export function includes (arr: unknown[], val: unknown[]): boolean {
// for (const arrVal of arr) {
// if (shallowCompareObj(arrVal, val) === true) {
// return true;
// }
// }
// return false;
// }
