
/**
 * Waits for a specified amount of time.
 *
 * @async
 * @param {number} ms - The amount of time to sleep in milliseconds.
 * @returns {Promise<void>} - A promise that will be resolved after the specified time has elapsed.
 */
export async function sleep (ms: number): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, ms));
}
