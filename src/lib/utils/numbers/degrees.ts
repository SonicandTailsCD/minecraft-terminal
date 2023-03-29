export function radianToDeg (rad: number): number {
	return -rad * 180 / Math.PI;
}

export function degToRadian (deg: number): number {
	return deg * Math.PI / 180;
}

export function maxDeg (deg: number, max: number): number {
	return deg > max ? deg - 360 : deg;
}

export function unMaxDeg (deg: number): number {
	return deg < 0 ? deg + 360 : deg;
}
