import { escapeRegExp as escapeRegex } from './utils/strings';

function parse (str: string): boolean {
	let strCopy = str.toLowerCase().replace(/\s/g, '');

	// Helper function that evaluates and replaces logical operations
	// in strCopy with their corresponding result
	const evaluate = (ops: string[], andOr = '&'): void => {
		for (const op of ops) {
			const [bef, af] = op.split(andOr);

			if (bef === af) {
				if (bef === 'true') {
					strCopy = strCopy.replace(op, 'true');
					continue;
				}
				if (bef === 'false') {
					strCopy = strCopy.replace(op, 'false');
					continue;
				}
			}

			if (bef === 'true' || af === 'true') {
				if (andOr === '|') {
					strCopy = strCopy.replace(op, 'true');
					continue;
				}
				if (andOr === '&') {
					strCopy = strCopy.replace(op, 'false');
					continue;
				}
			}

			strCopy = strCopy.replace(op, 'false');
		}
	};

	// Keep parsing until it stops changing
	let oldStr = '';
	while (oldStr !== strCopy) {
		oldStr = strCopy.valueOf();

		// Parse &
		const andOps = strCopy.match(/[^()&|]+&[^()&|]+/g);
		if (andOps != null) {
			evaluate(andOps, '&');
		}

		// Parse |
		const orOps = strCopy.match(/[^()&|]+\|[^()&|]+/g);
		if (orOps != null) {
			evaluate(orOps, '|');
		}

		// Remove ()
		const pars = strCopy.match(/(?<=\()[^()&|]+(?=\))/g);
		if (pars != null) {
			for (const par of pars) {
				strCopy = strCopy.replace(`(${par})`, par);
			}
		}
	}

	if (strCopy === 'false') {
		return false;
	}
	if (strCopy === 'true') {
		return true;
	}

	throw new Error('Invalid input');
}
/**
	* Evaluates a string that represents a logical expression.
	* The string may contain variables that are replaced with their values from
	* the `values` object. If the `options.safe` flag is `true`, the function
	* will throw an error if any of the variables is not set to a boolean value.
	* If `options.safe` is `false`, any unknown variables will be replaced with
	* the value of the `options.assumeVal` flag before the string is parsed.
	*
	* @param {string} str - The string to evaluate.
	* @param {Object} values - An object containing the values of the variables
	* that appear in the string.
	* @param {Object} [options] - An optional settings object.
	* @param {boolean} [options.safe=true] - A flag that specifies whether the
	* function should throw an error if any of the variables is not set to a
	* boolean value.
	* @param {boolean} [options.assumeVal=false] - The value to assume for any
	* unknown variables if the `safe` flag is `false`.
	*
	* @return {boolean} The result of evaluating the string as a logical expression.
	*
	* @throws {Error} If the `str` argument is not of type string.
	* @throws {Error} If the `safe` flag is `true` and some variables are not
	* set to boolean values.
	*/
export function logicExp (str: string, values: object, options?: { safe?: boolean, assumeVal: boolean }): boolean {
	options = Object.assign({
		safe: true,
		assumeVal: false
	}, options);

	// Replace variables with their values
	if (values) {
		for (const valKey of Object.keys(values)) {
			str = str.replace(new RegExp(`((?<=[&|])|^)${escapeRegex(valKey)}`), values[valKey as keyof object]);
		}
	}

	// Parse the string
	const allVals = str.match(/[^()&|]+/g);

	if (options.safe === true && (allVals != null)) {
		// Throw an error if some variables were not set to booleans
		for (const val of allVals) {
			if (!['true', 'false'].includes(val)) {
				throw new Error('Value must be of type Boolean');
			}
		}
	} else if (allVals != null) {
		// Replace all unknown vars with assumeVal
		for (const val of allVals) {
			if (!['true', 'false'].includes(val)) {
				str = str.replace(val, String(options.assumeVal));
			}
		}
	}

	return parse(str);
}
