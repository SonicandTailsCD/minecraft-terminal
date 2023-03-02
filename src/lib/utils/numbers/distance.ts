/**
 * The distance function calculates the distance between two points in 3d space.
 *
 *
 * @param {{ x: number, y: number, z: number }} v1
 * @param {{ x: number, y: number, z: number }} v2
 * @return The distance between two points.
 * @example
 * const point1 = { x: 1, y: 2, z: 3 };
 * const point2 = { x: 2, y: 3.66, z: 2.5 };
 * console.log(distance(point1, point2)); // ~2
 */
export function distance (
	p1: { x?: number, y?: number, z?: number },
	p2: { x?: number, y?: number, z?: number }
): number {
	const v1 = { ...{ x: 0, y: 0, z: 0 }, ...p1 };
	const v2 = { ...{ x: 0, y: 0, z: 0 }, ...p2 };

	return Math.sqrt(
		Math.pow(v1.x - v2.x, 2) +
		Math.pow(v1.y - v2.y, 2) +
		Math.pow(v1.z - v2.z, 2)
	);
}
