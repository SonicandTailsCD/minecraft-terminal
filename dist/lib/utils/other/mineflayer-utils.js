"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = exports.followEntityWithJump = exports.getYawAndPitchToVec = exports.getYawAndPitchToVecMaxReach = exports.lookAtVecMaxReach = exports.lookAtVec = exports.botAttack = exports.moveXZ = exports.look = exports.directionToPitch = exports.directionToYaw = exports.placeBlock = exports.digBlock = exports.rayCastToBlockFromEntity = exports.blockID2Vec = exports.blockFace2Vec = exports.face2BlockID = exports.reverseFaceID = exports.blockID2Face = exports.getItems = void 0;
const withPriority_js_1 = require("./withPriority.js");
const sleep_js_1 = require("../../helpers/sleep.js");
const utils_js_1 = require("./utils.js");
const vec3_js_1 = require("../../vec3.js");
const index_js_1 = require("../numbers/index.js");
let bot;
let botLookPriorityCache = {
    priority: 0,
    cooldown: 0
};
function getItems(window, gt, lt) {
    return window.slots.filter(item => item && (!lt || item.slot >= lt) && (!gt || item.slot <= gt));
}
exports.getItems = getItems;
exports.blockID2Face = [
    'down',
    'up',
    'south',
    'north',
    'east',
    'west'
];
function reverseFaceID(ID) {
    if (ID % 2 === 0)
        return ID + 1;
    else
        return ID - 1;
}
exports.reverseFaceID = reverseFaceID;
exports.face2BlockID = {
    down: 0,
    up: 1,
    south: 2,
    north: 3,
    east: 4,
    west: 5
};
exports.blockFace2Vec = {
    west: (0, vec3_js_1.v)(1, 0, 0),
    up: (0, vec3_js_1.v)(0, 1, 0),
    north: (0, vec3_js_1.v)(0, 0, 1),
    east: (0, vec3_js_1.v)(-1, 0, 0),
    down: (0, vec3_js_1.v)(0, -1, 0),
    south: (0, vec3_js_1.v)(0, 0, -1)
};
exports.blockID2Vec = [
    (0, vec3_js_1.v)(0, -1, 0),
    (0, vec3_js_1.v)(0, 1, 0),
    (0, vec3_js_1.v)(0, 0, -1),
    (0, vec3_js_1.v)(0, 0, 1),
    (0, vec3_js_1.v)(-1, 0, 0),
    (0, vec3_js_1.v)(1, 0, 0)
];
function rayCastToBlockFromEntity(entity, target, range = 256, matcher = () => { return true; }) {
    if (!entity?.position || !entity.height || !target) {
        return null;
    }
    const entityEyePos = entity.position.offset(0, entity.height, 0);
    target = target.offset(-entityEyePos.x, -entityEyePos.y, -entityEyePos.z);
    return bot.world.raycast(entityEyePos, target, range, matcher);
}
exports.rayCastToBlockFromEntity = rayCastToBlockFromEntity;
async function digBlock(position) {
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
exports.digBlock = digBlock;
function getAdjacentBlocks(position) {
    const adjacentBlocks = [];
    for (let faceID = 0; faceID < exports.blockID2Face.length; faceID++) {
        const faceVec = exports.blockFace2Vec[exports.blockID2Face[faceID]];
        const block = bot.blockAt(position.offset(faceVec.x, faceVec.y, faceVec.z));
        if (block !== null) {
            adjacentBlocks.push({ block, face: reverseFaceID(faceID) });
        }
    }
    return adjacentBlocks;
}
async function placeBlock(position) {
    const block = bot.blockAt(position);
    if (block?.boundingBox !== 'empty') {
        throw new Error('Block is not empty');
    }
    const sneakState = bot.getControlState('sneak');
    const { yaw, pitch } = bot.entity;
    const done = async () => {
        await bot.look(yaw, pitch, true);
        bot.setControlState('sneak', sneakState);
        return true;
    };
    const adjBlocks = getAdjacentBlocks(position)
        .filter(adjBlock => adjBlock?.block.boundingBox !== 'empty');
    if (adjBlocks.length === 0) {
        throw new Error('There are no valid blocks next to there');
    }
    for (const { block: adjBlock, face: adjBlockFace } of adjBlocks) {
        let offset = exports.blockID2Vec[adjBlockFace];
        Object.entries(offset).forEach(([axis, value]) => {
            const off = value < 0 ? 1 : 0.5;
            if (value !== 1) {
                switch (axis) {
                    case 'x':
                        offset = offset.offset(off, 0, 0);
                        break;
                    case 'y':
                        offset = offset.offset(0, off, 0);
                        break;
                    case 'z':
                        offset = offset.offset(0, 0, off);
                        break;
                }
            }
        });
        await lookAtVec(adjBlock.position.plus(offset), true);
        const blockRef = bot.blockAtCursor(4);
        if (!blockRef || blockRef.face !== adjBlockFace || (0, index_js_1.distance)(blockRef.position, adjBlock.position) !== 0) {
            continue;
        }
        bot.setControlState('sneak', true);
        await (0, sleep_js_1.sleep)(10);
        try {
            await bot.placeBlock(adjBlock, exports.blockID2Vec[blockRef.face]);
        }
        catch (err) {
            await done();
            throw new Error('Impossible to place block from this angle');
        }
        await done();
        const placedBlock = bot.blockAt(adjBlock.position);
        if (placedBlock?.boundingBox === 'empty') {
            return null;
        }
        return placedBlock;
    }
}
exports.placeBlock = placeBlock;
exports.directionToYaw = {
    north: 180,
    south: 0,
    east: -90,
    west: 90
};
exports.directionToPitch = {
    up: 0,
    down: 90
};
async function look(yaw, pitch, force = true) {
    await bot.look((0, index_js_1.isNumber)(yaw) ? (0, index_js_1.degToRadian)((0, index_js_1.clamp)((0, index_js_1.maxDeg)(180 - yaw, 180), -180, 180)) : bot.entity.yaw, (0, index_js_1.isNumber)(pitch) ? (0, index_js_1.degToRadian)((0, index_js_1.clamp)((0, index_js_1.maxDeg)(-pitch, 90), -90, 90)) : bot.entity.pitch, force);
}
exports.look = look;
async function moveXZ(x, z, range = 0.1, timeout = (0, index_js_1.distance)({ x: bot.entity.position.x, z: bot.entity.position.z }, { x, z }) * 4000) {
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
    let dist = (0, index_js_1.distance)({ x: bot.entity.position.x, z: bot.entity.position.z }, goal) - 0.16;
    let oldDist = dist.valueOf() + 1;
    let int = 50;
    bot.setControlState('sprint', true);
    bot.setControlState('forward', true);
    await (0, withPriority_js_1.withPriority)(9, 100, true, false, botLookPriorityCache, async () => {
        await lookAtVec((0, vec3_js_1.v)(x, bot.entity.position.y + bot.entity.height, z), true);
    });
    await (0, sleep_js_1.sleep)(60);
    while (dist >= range && dist < oldDist) {
        if (Date.now() >= timeout) {
            throw new Error('Timeout reached');
        }
        oldDist = dist.valueOf();
        await (0, withPriority_js_1.withPriority)(9, 100, true, false, botLookPriorityCache, async () => {
            await lookAtVec((0, vec3_js_1.v)(x, bot.entity.position.y + bot.entity.height, z), true);
        });
        await (0, sleep_js_1.sleep)(int);
        dist = (0, index_js_1.distance)({ x: bot.entity.position.x, z: bot.entity.position.z }, goal) - 0.16;
        const a = dist * 100;
        if (a < 5)
            int = 5;
        else
            int = a;
    }
    bot.setControlState('sprint', sprintState);
    bot.setControlState('forward', false);
    await bot.look(yaw, pitch, true);
    if (Math.floor(dist) - 0.1 > range) {
        throw new Error('Path was obstructed');
    }
}
exports.moveXZ = moveXZ;
async function botAttack(minReach, maxReach, entity, force = true) {
    if (!entity?.position || ['object', 'orb'].includes(entity.type)) {
        return;
    }
    const attack = () => {
        const ent = bot.entityAtCursor(maxReach + 0.5);
        if (ent && (0, utils_js_1.shallowCompareObj)(ent, entity)) {
            bot.attack(ent);
            return true;
        }
        return false;
    };
    const dist = (0, index_js_1.distance)(entity.position.offset(0, entity.height, 0), bot.entity.position.offset(0, bot.entity.height, 0));
    if (dist > maxReach || dist < minReach) {
        return;
    }
    if (attack()) {
        return;
    }
    await (0, withPriority_js_1.withPriority)(4, 200, true, false, botLookPriorityCache, async () => {
        await lookAtVecMaxReach(entity.position, entity.height, entity.width, force);
    });
    attack();
}
exports.botAttack = botAttack;
async function lookAtVec(targetPos, force = true) {
    const pos = getYawAndPitchToVec(targetPos);
    await bot.look(pos.yaw, pos.pitch, force);
}
exports.lookAtVec = lookAtVec;
async function lookAtVecMaxReach(targetPos, targetHeight, targetWidth, force = true) {
    const pos = getYawAndPitchToVecMaxReach(targetPos, targetHeight, targetWidth);
    await bot.look(pos.yaw, pos.pitch, force);
}
exports.lookAtVecMaxReach = lookAtVecMaxReach;
function getYawAndPitchToVecMaxReach(targetPos, targetHeight, targetWidth) {
    const delta = targetPos.minus(bot.entity.position.offset(0, bot.entity.height, 0));
    const distance = Math.sqrt(delta.x * delta.x + delta.z * delta.z);
    let pitch;
    if (delta.y > 0) {
        pitch = Math.atan(delta.y / distance);
    }
    else if (delta.y < -targetHeight) {
        pitch = Math.atan((delta.y + targetHeight) / distance);
    }
    else {
        pitch = 0;
    }
    const yaw = Math.atan2(-delta.x, -delta.z);
    return { yaw, pitch };
}
exports.getYawAndPitchToVecMaxReach = getYawAndPitchToVecMaxReach;
function getYawAndPitchToVec(targetPos) {
    const delta = targetPos.minus(bot.entity.position.offset(0, bot.entity.height, 0));
    const distance = Math.sqrt(delta.x * delta.x + delta.z * delta.z);
    const pitch = Math.atan(delta.y / distance);
    const yaw = Math.atan2(-delta.x, -delta.z);
    return { yaw, pitch };
}
exports.getYawAndPitchToVec = getYawAndPitchToVec;
async function followEntityWithJump(entity, range) {
    const dist = (0, index_js_1.distance)({ x: bot.entity.position.x, z: bot.entity.position.z }, { x: entity.position.x, z: entity.position.z });
    if (dist >= range) {
        bot.setControlState('sprint', true);
        const dir = entity.position.clone().offset(-bot.entity.position.x, -entity.position.y, -bot.entity.position.z).normalize();
        const blockInFront = bot.blockAt(bot.entity.position.plus(dir))?.boundingBox !== 'empty' ||
            bot.blockAt(bot.entity.position.plus(dir.scaled(2.4)))?.boundingBox !== 'empty';
        if (blockInFront && bot.entity.onGround) {
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
        }
        await (0, withPriority_js_1.withPriority)(3, 150, false, false, botLookPriorityCache, async () => {
            const { yaw } = getYawAndPitchToVec(entity.position);
            const yawDiff = Math.abs(bot.entity.yaw - yaw);
            if (yawDiff > 0.15) {
                await bot.look(yaw, bot.entity.pitch, true);
            }
        });
        bot.setControlState('forward', true);
    }
    else {
        bot.setControlState('forward', false);
    }
}
exports.followEntityWithJump = followEntityWithJump;
function setup(BOT, lookPriority) {
    bot = BOT;
    botLookPriorityCache = lookPriority;
}
exports.setup = setup;
