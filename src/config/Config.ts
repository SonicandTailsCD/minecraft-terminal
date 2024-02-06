import { type Movements } from 'mineflayer-pathfinder';

export class Config {
	public language = 'EN';

	public RCON: {
		enabled: boolean
		RegEx: string
		RegExFlags: string
	} = {
			enabled: true,
			RegEx: '(?<=/)+',
			RegExFlags: ''
		};

	public commands: {
		commandPrompt: string
		enableNonVanillaCMD: boolean
		commandAliases: Record<string, string>
	} = {
			commandPrompt: '> ',
			enableNonVanillaCMD: true,
			commandAliases: {}
		};

	public mineflayer: {
		movements: {
			canDig: Movements['canDig']
			digCost: Movements['digCost']
			scafoldingBlocks: Movements['scafoldingBlocks']
			placeCost: Movements['placeCost']
			liquidCost: number
			entityCost: Movements['entityCost']
			dontCreateFlow: Movements['dontCreateFlow']
			dontMineUnderFallingBlock: Movements['dontMineUnderFallingBlock']
			allow1by1towers: Movements['allow1by1towers']
			allowFreeMotion: Movements['allowFreeMotion']
			allowParkour: Movements['allowParkour']
			allowSprinting: Movements['allowSprinting']
			allowEntityDetection: Movements['allowEntityDetection']
			canOpenDoors: boolean
			maxDropDown: Movements['maxDropDown']
			infiniteLiquidDropdownDistance: Movements['infiniteLiquidDropdownDistance']
			bot: {
				physicsEnabled: boolean
				settings: {
					chat: string
					colorsEnabled: boolean
					viewDistance: 'tiny' | 'short' | 'normal' | 'far' | number
					mainHand: 'left' | 'right'
					enableTextFiltering: boolean
					enableServerListing: boolean
					skinParts: {
						showCape: boolean
						showJacket: boolean
						showLeftSleeve: boolean
						showRightSleeve: boolean
						showLeftPants: boolean
						showRightPants: boolean
						showHat: boolean
					}
				}
				pathfinder: {
					thinkTimeout: Movements['bot']['pathfinder']['thinkTimeout']
					tickTimeout: Movements['bot']['pathfinder']['tickTimeout']
					searchRadius: number
					enablePathShortcut: boolean
					LOSWhenPlacingBlocks: boolean
				}
			}
		}
	} = {
			movements: {
				canDig: true,
				digCost: 3,
				scafoldingBlocks: [1, 2, 3],
				placeCost: 3,
				liquidCost: 2,
				entityCost: 1,
				dontCreateFlow: true,
				dontMineUnderFallingBlock: true,
				allow1by1towers: true,
				allowFreeMotion: true,
				allowParkour: true,
				allowSprinting: true,
				allowEntityDetection: true,
				canOpenDoors: true,
				maxDropDown: 4,
				infiniteLiquidDropdownDistance: true,
				bot: {
					physicsEnabled: true,
					settings: {
						chat: 'enabled',
						colorsEnabled: true,
						viewDistance: 'far',
						mainHand: 'right',
						enableTextFiltering: false,
						enableServerListing: false,
						skinParts: {
							showCape: true,
							showJacket: true,
							showLeftSleeve: true,
							showRightSleeve: true,
							showLeftPants: true,
							showRightPants: true,
							showHat: true
						}
					},
					pathfinder: {
						thinkTimeout: 20000,
						tickTimeout: 2,
						searchRadius: 200,
						enablePathShortcut: true,
						LOSWhenPlacingBlocks: true
					}
				}
			}
		};

	constructor (options?: Partial<Config>) {
		Object.assign(this, options);
	}
}
