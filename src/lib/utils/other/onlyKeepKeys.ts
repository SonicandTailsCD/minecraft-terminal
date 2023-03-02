import { isPlainObject } from 'merge';

// Removes any properties in object1 that aren't in object2 (deep).
export function onlyKeepKeys<T extends object, U extends object> (
	obj1: T,
	obj2: U,
	options = { shallow: false }
): T & U {
	options = Object.assign({ shallow: false }, options);
	const obj2Keys = Object.keys(obj2);

	const outObj = Object.assign({}, obj1);
	const outObjKeys = Object.keys(outObj);

	for (const key of outObjKeys) {
		const areObjects = isPlainObject(outObj[key as keyof object]) && isPlainObject(obj2[key as keyof object]);

		if (!options.shallow && areObjects) {
			(outObj[key as keyof object] as object) =
				onlyKeepKeys(outObj[key as keyof object], obj2[key as keyof object], options);
			continue;
		}

		if (obj2Keys.includes(key)) {
			continue;
		}

		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete outObj[key as keyof object];
	}
	return outObj as T & U;
}
