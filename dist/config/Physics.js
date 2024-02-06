"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Physics = void 0;
class Physics {
    usePhysicsConfig = false;
    gravity = 0.08;
    airdrag = 0.9800000190734863;
    yawSpeed = 3;
    pitchSpeed = 3;
    playerSpeed = 0.1;
    sprintSpeed = 0.3;
    sneakSpeed = 0.3;
    stepHeight = 0.6;
    negligeableVelocity = 0.003;
    soulsandSpeed = 0.4;
    honeyblockSpeed = 0.4;
    honeyblockJumpSpeed = 0.4;
    ladderMaxSpeed = 0.15;
    ladderClimbSpeed = 0.2;
    playerHalfWidth = 0.3;
    playerHeight = 1.8;
    waterInertia = 0.8;
    lavaInertia = 0.5;
    liquidAcceleration = 0.02;
    airborneInertia = 0.91;
    airborneAcceleration = 0.02;
    defaultSlipperiness = 0.6;
    outOfLiquidImpulse = 0.3;
    autojumpCooldown = 10;
    slowFalling = 0.125;
    waterGravity = 0.02;
    lavaGravity = 0.02;
    constructor(options) {
        Object.assign(this, options);
    }
}
exports.Physics = Physics;
