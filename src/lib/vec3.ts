// @ts-nocheck

import ve, { type Vec3 } from 'vec3';
export { Vec3 } from 'vec3';

export const v = ve as unknown as (
	x: number | Array<number | string> | { x: number | string, y: number | string, z: number | string } | string,
	y?: number | string,
	z?: number | string
) => Vec3;
