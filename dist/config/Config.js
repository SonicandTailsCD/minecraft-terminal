"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    language = 'EN';
    RCON = {
        enabled: true,
        RegEx: '(?<=/)+',
        RegExFlags: ''
    };
    commands = {
        commandPrompt: '> ',
        enableNonVanillaCMD: true,
        commandAliases: {}
    };
    mineflayer = {
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
    constructor(options) {
        Object.assign(this, options);
    }
}
exports.Config = Config;
