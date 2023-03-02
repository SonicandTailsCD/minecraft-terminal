import { type Vec3, v } from '../../vec3.js';

export function pointsInBetween (v1: Vec3, v2: Vec3): Vec3[] {
	// Determine the range of x, y, and z values between the two points
	const xRange = Math.abs(v1.x - v2.x);
	const yRange = Math.abs(v1.y - v2.y);
	const zRange = Math.abs(v1.z - v2.z);

	// Create an array to store all the points between A and B
	const points = [];

	// Iterate over all the x, y, and z values between the two points
	for (let x = 0; x <= xRange; x++) {
		for (let y = 0; y <= yRange; y++) {
			for (let z = 0; z <= zRange; z++) {
				// Calculate the coordinates of the current point
				const point = v(
					Math.min(v1.x, v2.x) + x,
					Math.min(v1.y, v2.y) + y,
					Math.min(v1.z, v2.z) + z
				);
				// Add the current point to the array of points
				points.push(point);
			}
		}
	}

	return points;
}
