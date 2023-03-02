export function mergeArray (
	arr1: unknown[],
	arr2: unknown[],
	options = { mutate: false, typeCheck: false }
): unknown[] {
	const { mutate = false, typeCheck = false } = options;

	const merged = mutate ? arr1 : [...arr1];

	for (const [index, item] of arr2.entries()) {
		if (typeCheck) {
			if (typeof item === typeof merged[0]) {
				merged[index] = item;
			}
			continue;
		}
		merged[index] = item;
	}
	return merged;
}

export function mergeObjects<T extends object, U extends object> (
	obj1: T, obj2: U,
	options: {
		mutate?: boolean
		typeCheck?: boolean
		typeCheckUndefined?: boolean
	} = {
		mutate: false,
		typeCheck: false,
		typeCheckUndefined: true
	}
): T & U {
	const { mutate = false, typeCheck = false, typeCheckUndefined = true } = options;

	if (Array.isArray(obj1) || Array.isArray(obj2)) {
		return obj2 as T & U;
	}

	const merged = mutate ? obj1 : { ...obj1 };
	for (const key in obj2) {
		if (!obj2.hasOwnProperty(key)) {
			continue;
		}

		const keyInBoth = key as keyof object;
		const obj1Value = obj1[keyInBoth];
		const obj2Value = obj2[keyInBoth];

		if (typeof obj1Value === 'object' && typeof obj2Value === 'object') {
			merged[keyInBoth] = mergeObjects(obj1Value, obj2Value, options);
			continue;
		}

		if (!typeCheck || (
			!typeCheckUndefined && obj1Value === undefined
		) || typeof obj1Value === typeof obj2Value) {
			merged[keyInBoth] = obj2Value;
		}
	}

	return merged as T & U;
}
