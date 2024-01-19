export class Physics {
	public usePhysicsConfig = false;
	public gravity = 0.08;
	public airdrag = 0.9800000190734863;
	public yawSpeed = 3;
	public pitchSpeed = 3;
	public playerSpeed = 0.1;
	public sprintSpeed = 0.3;
	public sneakSpeed = 0.3;
	public stepHeight = 0.6;
	public negligeableVelocity = 0.003;
	public soulsandSpeed = 0.4;
	public honeyblockSpeed = 0.4;
	public honeyblockJumpSpeed = 0.4;
	public ladderMaxSpeed = 0.15;
	public ladderClimbSpeed = 0.2;
	public playerHalfWidth = 0.3;
	public playerHeight = 1.8;
	public waterInertia = 0.8;
	public lavaInertia = 0.5;
	public liquidAcceleration = 0.02;
	public airborneInertia = 0.91;
	public airborneAcceleration = 0.02;
	public defaultSlipperiness = 0.6;
	public outOfLiquidImpulse = 0.3;
	public autojumpCooldown = 10;
	public slowFalling = 0.125;
	public waterGravity = 0.02;
	public lavaGravity = 0.02;

	constructor (options?: Partial<Physics>) {
		Object.assign(this, options);
	}
}
