import { sleep } from '../../helpers/sleep.js';

export class Priority {
	public priority = 0;
	public cooldown = 0;
}

export async function withPriority (
	priority = 0,
	cooldown = 0,
	doIfOnCooldown = true,
	countSamePriority = false,
	cache = new Priority(),
	callback?: () => void | Promise<void>
): Promise<void> {
	if (isNaN(cooldown)) {
		return;
	}

	let shouldCallback = false;

	if (priority < cache.priority || (countSamePriority && priority <= cache.priority)) {
		const sleepTime = cache.cooldown - Date.now();

		if (sleepTime > 0) {
			await sleep(sleepTime);
			shouldCallback = true;
		}
	}

	if (cache.cooldown < Date.now() + cooldown) {
		cache.priority = priority;
		cache.cooldown = Date.now() + cooldown;
	}

	if (shouldCallback || doIfOnCooldown) {
		await callback?.();
	}
}
