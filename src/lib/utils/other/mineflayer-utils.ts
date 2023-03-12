import { type Priority, withPriority } from './withPriority.js';
import { type Window } from 'prismarine-windows';
import { sleep } from '../../helpers/sleep.js';
import { shallowCompareObj } from './utils.js';
import { type Block } from 'prismarine-block';
import { type Entity } from 'minecraft-data';
import { v, type Vec3 } from '../../vec3.js';
import { distance } from '../numbers';
import { type Bot } from 'mineflayer';

let bot: Bot;
let botLookPriorityCache = {
	priority: 0,
	cooldown: 0
};

/*
	* The getItems function returns an array of non empty items from the window.slots
	* property.
	*/
export function getItems (window: Window, gt: number, lt: number): Array<typeof window.slots[0]> {
	return window.slots.filter(item => item && (!lt || item.slot >= lt) && (!gt || item.slot <= gt));
}

export const blockID2Face: ['down', 'up', 'south', 'north', 'east', 'west'] = [
	'down',
	'up',
	'south',
	'north',
	'east',
	'west'
];

export function reverseFaceID (ID: number): number {
	if (ID % 2 === 0) return ID + 1;
	else return ID - 1;
}

export const face2BlockID = {
	down: 0,
	up: 1,
	south: 2,
	north: 3,
	east: 4,
	west: 5
};

export const blockFace2Vec = {
	west: v([1, 0, 0]),
	up: v([0, 1, 0]),
	north: v([0, 0, 1]),
	east: v([-1, 0, 0]),
	down: v([0, -1, 0]),
	south: v([0, 0, -1])
};

export const blockID2Vec: [
	Vec3, Vec3, Vec3,
	Vec3, Vec3, Vec3
] = [
	v([0, -1, 0]),
	v([0, 1, 0]),
	v([0, 0, -1]),
	v([0, 0, 1]),
	v([-1, 0, 0]),
	v([1, 0, 0])
];

/**
	* Cast a ray from the entity's eye position to the target block.
	* The ray is casted in increments of 32 blocks, and if it hits any block, it will return an object containing
	* information about that block. If no blocks are hit within range (default 256), then null is returned instead.
	*
	* @param entity Entity to raycast from.
	* @param target Target position.
	* @param range Maximum distance that the raycast can travel.
	* @param matcher Filter out blocks that are not of interest.
	* @return The block object.
	*/
export function rayCastToBlockFromEntity (
	entity: { position: Vec3, height: number },
	target: Vec3, range = 256, matcher = () => { return true }
): Block | null {
	if (!entity?.position || !entity.height || !target) {
		return null;
	}
	const entityEyePos = entity.position.offset(0, entity.height, 0);
	target = target.offset(-entityEyePos.x, -entityEyePos.y, -entityEyePos.z);
	return bot.world.raycast(entityEyePos, target, range, matcher);
}

/**
	* The digBlock function digs a block at the given position.
	*
	* @param position Position of the block to dig
	* @return The block object.
	*
	*/
export async function digBlock (position: Vec3): Promise<Block> {
	// Check if it's possible to dig block
	const block = bot.blockAt(position);
	if (block == null) {
		throw new Error('Block doesn\'t exist');
	}

	if (block.boundingBox === 'empty') {
		throw new Error('There is no valid block to dig');
	}

	await bot.dig(block, true, 'raycast');

	return block;
}

// function nplaceBlock (position: Vec3) {
// // a
// }

function getAdjacentBlocks (position: Vec3): Array<{ block: Block, face: number }> {
	const adjacentBlocks = [];
	for (let faceID = 0; faceID < blockID2Face.length; faceID++) {
		const faceVec: Vec3 = blockFace2Vec[blockID2Face[faceID]];
		const block = bot.blockAt(position.offset(faceVec.x, faceVec.y, faceVec.z));

		if (block !== null) {
			adjacentBlocks.push({ block, face: reverseFaceID(faceID) });
		}
	}

	return adjacentBlocks;
}

/**
	* The placeBlock function places a block next to the given position.
	*
	* @param position Position of the block to place
	* @return The block object
	*
	*/
export async function placeBlock (position: Vec3): Promise<Block | null | undefined> {
	// Check if it's possible to place a block there
	const block = bot.blockAt(position);
	if (block?.boundingBox !== 'empty') {
		throw new Error('Block is not empty');
	}

	// Get states to reset them later
	const sneakState = bot.getControlState('sneak');
	const { yaw, pitch } = bot.entity;
	const done = async (): Promise<true> => {
		await bot.look(yaw, pitch, true);
		bot.setControlState('sneak', sneakState);
		return true;
	};

	// Get all valid blocks that are next to where we wanna place our block
	const adjBlocks = getAdjacentBlocks(position)
		.filter(adjBlock => adjBlock?.block.boundingBox !== 'empty');

	if (adjBlocks.length === 0) {
		throw new Error('There are no valid blocks next to there');
	}

	for (const { block: adjBlock, face: adjBlockFace } of adjBlocks) {
		// Use an offset to look at the correct face of the block instead of its insides
		let offset = blockID2Vec[adjBlockFace];
		Object.entries(offset).forEach(([axis, value]) => {
			const off = value < 0 ? 1 : 0.5;
			if (value !== 1) {
				switch (axis) {
					case 'x': offset = offset.offset(off, 0, 0); break;
					case 'y': offset = offset.offset(0, off, 0); break;
					case 'z': offset = offset.offset(0, 0, off); break;
				}
			}
		});

		// Using this instead of rayCastToBlockFromEntity because it gives the face property
		await bot.lookAt(adjBlock.position.plus(offset), true);
		const blockRef = bot.blockAtCursor(4);

		if (!blockRef || blockRef.face !== adjBlockFace || distance(blockRef.position, adjBlock.position) !== 0) {
			continue;
		}

		// Place the block
		bot.setControlState('sneak', true);
		await sleep(10);
		try {
			await bot.placeBlock(adjBlock, blockID2Vec[blockRef.face]);
		} catch (err) {
			await done();
			throw new Error('Impossible to place block from this angle');
		}
		await done();

		// Return the placed block
		const placedBlock = bot.blockAt(adjBlock.position);
		if (placedBlock?.boundingBox === 'empty') {
			return null;
		}
		return placedBlock;
	}
}

export const directionToYaw = {
	north: 180,
	south: 0,
	east: -90,
	west: 90
};

export const directionToPitch = {
	up: 0,
	down: 90
};

export async function look (pitch: number, yaw: number, force: boolean): Promise<void> {
	// markiplier
	const multiplier = 19.09877648466666 * bot.physics.yawSpeed;
	await bot.look(-(Number(yaw) + 180) / multiplier, -pitch / multiplier, force);
}

/**
	* The move function moves the bot to a specified location.
	*
	*
	* @param range Max distance to block.
	* @param timeout
	* @return True if the bot is within range of the goal, false otherwise.
	*
	*/
export async function moveXZ (
	x: number,
	z: number,
	range = 0.1,
	timeout = distance({ x: bot.entity.position.x, z: bot.entity.position.z }, { x, z }) * 4000
): Promise<void> {
	if ([
		bot.getControlState('forward'),
		bot.getControlState('back'),
		bot.getControlState('right'),
		bot.getControlState('left')
	].includes(true)) {
		throw new Error('Bot must not be moving');
	}

	timeout = Date.now() + timeout;
	const yaw = bot.entity.yaw;
	const pitch = bot.entity.pitch;
	const sprintState = bot.getControlState('sprint');
	const goal = { x: Math.floor(x) + 0.5, z: Math.floor(z) + 0.5 };
	let dist = distance({ x: bot.entity.position.x, z: bot.entity.position.z }, goal) - 0.16;
	let oldDist = dist.valueOf() + 1;
	let int = 50;
	bot.setControlState('sprint', true);
	bot.setControlState('forward', true);
	await withPriority(9, 100, true, false, botLookPriorityCache, async () => {
		await bot.lookAt(v(x, bot.entity.position.y + bot.entity.height, z), true);
	});
	await sleep(60);
	while (dist >= range && dist < oldDist) {
		if (Date.now() >= timeout) {
			throw new Error('Timeout reached');
		}
		oldDist = dist.valueOf();
		await withPriority(9, 100, true, false, botLookPriorityCache, async () => {
			await bot.lookAt(v(x, bot.entity.position.y + bot.entity.height, z), true);
		});
		await sleep(int);
		dist = distance({ x: bot.entity.position.x, z: bot.entity.position.z }, goal) - 0.16;
		const a = dist * 100;
		if (a < 5) int = 5;
		else int = a;
	}
	bot.setControlState('sprint', sprintState);
	bot.setControlState('forward', false);
	await bot.look(yaw, pitch, true);
	if (Math.floor(dist) - 0.1 > range) {
		throw new Error('Path was obstructed');
	}
}

interface EEntity extends Entity { position: Vec3 }

/**
	* Attacks an entity.
	*/
export async function botAttack (minReach: number, maxReach: number, entity: EEntity): Promise<void> {
	if (!entity?.position || ['object', 'orb'].includes(entity.type)) {
		return;
	}
	const dist = distance(entity.position, bot.entity.position);
	if (dist < maxReach && dist > minReach) {
		let yaw;
		let pitch;
		let ent = bot.entityAtCursor(maxReach);
		if (shallowCompareObj(ent, entity)) {
			bot.attack(ent);
			return;
		}
		await withPriority(3, 0, true, false, botLookPriorityCache, async () => {
			const lookAt = v(entity.position.x, entity.position.y + (entity.height ?? 0), entity.position.z);
			yaw = bot.entity.yaw;
			pitch = bot.entity.pitch;
			await bot.lookAt(lookAt, true);
		});
		ent = bot.entityAtCursor(maxReach);
		if (shallowCompareObj(ent, entity)) {
			bot.attack(ent);
			return;
		}
		if (yaw && pitch) {
			await bot.look(yaw, pitch, true);
		}
	}
}

export function setup (BOT: Bot, lookPriority: Priority): void {
	bot = BOT;
	botLookPriorityCache = lookPriority;
}
