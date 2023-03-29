/* eslint-disable import/export */
// @ts-nocheck

import { Vec3 } from 'vec3';
import { isNumber } from './utils/numbers/isNumber';
export { Vec3 } from 'vec3';

export function v (xyzStr: string): Vec3;
export function v (x: number, y: number, z: number): Vec3;
export function v (xyz: [number, number, number]): Vec3;
export function v (xyz: { x: number, y: number, z: number }): Vec3;
export function v (
	arg1: string | number | [number, number, number] | { x: number, y: number, z: number },
	arg2?: number,
	arg3?: number
): Vec3 {
	let x: number, y: number, z: number;

	if (typeof arg1 === 'string') {
		const [xStr, yStr, zStr] = arg1.split(',');
		x = parseFloat(xStr.trim());
		y = parseFloat(yStr.trim());
		z = parseFloat(zStr.trim());
	} else if (isNumber(arg1) && isNumber(arg2) && isNumber(arg3)) {
		x = arg1;
		y = arg2;
		z = arg2;
	} else if (Array.isArray(arg1)) {
		[x, y, z] = arg1;
	} else if (typeof arg1 === 'object' && 'x' in arg1 && 'y' in arg1 && 'z' in arg1) {
		x = arg1.x;
		y = arg1.y;
		z = arg1.z;
	} else {
		throw new Error('Invalid input');
	}

	return new Vec3(x, y, z);
}
