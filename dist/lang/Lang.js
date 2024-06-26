"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lang = exports.CommandLang = void 0;
class CommandLang {
    constructor(options) {
        Object.assign(this, options);
    }
    description;
    usage;
    subCommands;
}
exports.CommandLang = CommandLang;
class Lang {
    name = 'EN';
    data = {
        logger: {
            info: 'INFO',
            warn: 'WARN',
            error: 'ERR',
            debug: 'Debug',
            success: 'OK'
        },
        login: {
            auth: 'Auth: ',
            username: 'Login: ',
            password: 'Password: ',
            serverIP: 'Server: ',
            MCVersion: 'Version: '
        },
        misc: {
            loading: 'Loading...',
            connection: 'Connecting...',
            loggingIn: 'Logging in...',
            loggedIn: 'Connected'
        },
        commands: {
            exit: {
                description: 'Gracefully log off',
                usage: undefined
            },
            reco: {
                description: 'Reconnect to the same server',
                usage: undefined
            },
            send: {
                description: 'Send a message in chat (or just type your message without .send)',
                usage: 'Usage: .send [message goes here]'
            },
            position: {
                description: "Output bot's current position",
                usage: undefined
            },
            distance: {
                description: 'Show the distance between two points',
                usage: 'Usage: .distance <X1> <Y1> <Z1> <X2> <Y2> <Z2>'
            },
            list: {
                description: 'List all players connected to this server and their ping',
                usage: undefined
            },
            blocks: {
                description: 'Show blocks in a specified radius and filter',
                usage: 'Usage: blocks <Range> [Count]. Range > 0'
            },
            dig: {
                description: 'Dig a block in a specific location if possible',
                usage: 'Usage: dig <X> <Y> <Z>'
            },
            stopDig: {
                description: 'Stop digging immediately',
                usage: undefined
            },
            digMap: {
                description: 'Make an invisible cube (only bot sees this) where the bot always tries digging the blocks inside it',
                usage: 'Usage: digMap <Action: add|remove|clear|addspace|show>',
                subCommands: {
                    add: {
                        description: "Add a block's coordinates",
                        usage: 'Usage: digMap.add <X> <Y> <Z>'
                    },
                    addspace: {
                        description: "Add all block's in inside the coordinates",
                        usage: 'Usage: digMap.add <X1> <Y1> <Z1> <X2> <Y2> <Z2>'
                    },
                    remove: {
                        description: "Remove a block's coordinates",
                        usage: 'Usage: digMap.remove <X> <Y> <Z>'
                    },
                    clear: {
                        description: 'Clear all added block coordinates',
                        usage: 'Usage: digMap.clear'
                    },
                    show: {
                        description: 'List all added block coordinates',
                        usage: 'Usage: digMap.show'
                    }
                }
            },
            place: {
                description: 'Place a block in a specific location if possible',
                usage: 'Usage: place <X> <Y> <Z>'
            },
            move: {
                description: 'Move the player in blocks',
                usage: 'Usage: move <Direction:north|south|east|west> [distance]. Distance > 0'
            },
            moveTo: {
                description: 'Move in a straight line to a specific set of coordinates',
                usage: 'Usage: moveTo <X> <Z>'
            },
            pathfind: {
                description: 'Same as moveTo but uses advanced pathfinding (bad with anti cheats)',
                usage: 'Usage: pathfind <X> <Z or Y> [Z]'
            },
            forceMove: {
                description: 'Move the bot in seconds',
                usage: undefined
            },
            control: {
                description: 'Set a control state of the bot',
                usage: 'Usage: control <Control: forward|back|left|right|jump|sneak> <State: true, false>'
            },
            follow: {
                description: 'Follow a player',
                usage: 'Usage: follow <EntityMatches:$name=pig|$name!=pig|...> <Range>. Range > 0'
            },
            smartFollow: {
                description: "It's the same as follow but uses (not so) advanced pathfinding (very bad with anti cheats)",
                usage: 'Usage: smartfollow <EntityMatchRequest:$name=pig|$name!=pig|...> <Range>. The range HAS to be above 0.'
            },
            unFollow: {
                description: 'Stop following',
                usage: undefined
            },
            attack: {
                description: 'Attack an entity',
                usage: 'Usage: attack <EntityMatches:$name=pig|$name!=pig|...> <CPS> <MaxReach> <MinReach>. MaxReach > MinReach, CPS > 0'
            },
            stopAttack: {
                description: 'Stop attacking',
                usage: undefined
            },
            look: {
                description: 'Look in a certain direction',
                usage: 'Usage: look [Direction:north|south|east|west] [Yaw] [Pitch] [Force]'
            },
            lookAt: {
                description: 'Look at a player',
                usage: 'Usage: lookat <Player> <MaxReach> <MinReach> [Force:yes|y|no|n]. MaxReach number has to be above MinReach.'
            },
            stopLook: {
                description: 'Stop looking (player/coordinate)',
                usage: undefined
            },
            inventory: {
                description: 'Inventory management',
                usage: 'Usage: inventory <ID:0 (inventory) ID:1 (container), type the number> [Action:click|move|drop|dropall] [...Action Args]',
                subCommands: {
                    click: {
                        description: 'Click a slot in a container',
                        usage: 'Usage: inventory.click <Slot> <Button:left|right>'
                    },
                    swap: {
                        description: 'Swap two slots in a container',
                        usage: 'Usage: inventory.swap <Slot1> <Slot2>'
                    },
                    drop: {
                        description: 'Drop slots in a container',
                        usage: 'Usage: inventory.drop <...Slots>'
                    },
                    dropall: {
                        description: 'Drop all slots in a container',
                        usage: 'Usage: inventory.dropall'
                    }
                }
            },
            open: {
                description: 'Open a container (chest)',
                usage: 'Usage: open <X> <Y> <Z>'
            },
            changeSlot: {
                description: 'Change selected hotbar slot',
                usage: 'Usage: changeslot <Slot>. 0 <= Slot <= 8'
            },
            useItem: {
                description: 'Use a held item',
                usage: undefined
            },
            set: {
                description: 'Set a variable',
                usage: 'Usage: set <Key> <Value>'
            },
            unset: {
                description: 'Delete a variable',
                usage: 'Usage: unSet <Key>'
            },
            value: {
                description: 'Get value of a variable',
                usage: 'Usage: value <Key>'
            },
            variables: {
                description: 'List all set variables',
                usage: undefined
            },
            script: {
                description: 'Run a script',
                usage: 'Usage: script <Path>'
            },
            version: {
                description: 'Show package version',
                usage: undefined
            },
            help: {
                description: 'Shows this help message',
                usage: undefined
            }
        },
        infoMessages: {
            botMovingErr: 'Cannot use this command while this bot is moving.',
            botLookingOrAttackingErr: 'Cannot use this command while bot is attacking/looking at something.',
            connectErr: "Couldn't connect to server.",
            death: 'Bot died!',
            invalidCmd(cmd) {
                return `'${cmd}' isn't a valid command :(`;
            },
            nonVanillaCmd: 'This command makes the bot use some advanced (non-vanilla) features to work which will get you banned on some servers. You can enable it in the configuration, type "mc-term --get-conf-path" to get the location of your config file, then paste it inside your preferred file explorer. :)',
            scriptOnlyCmd: 'This command can only be used inside scripts',
            cantDigBlockAt(x, y, z, err) {
                return `Bot cannot dig block at ${x}, ${y}, ${z}.\n${(err).message}`;
            },
            alreadyRunning: "The command's already been triggered, dumbshit! :P",
            alreadyRunningNoSwears: 'Command already triggered :(',
            alreadyBlockThere: "There's already a block there",
            blockPlaceAdjErr: 'There should be a block right next to where you would place the block bro, otherwise you can get banned',
            yawPitchMaxErr: 'Yaw or Pitch cannot be more than 90 degrees',
            yawPitchMinErr: 'Yaw or Pitch cannot be less than -90 degrees',
            noInvToClose: 'There is nothing to close',
            noContainerOpenRN: 'There is no container opened right now',
            noCmdProvided: 'No command provided',
            invalidDirection(dir) {
                return `Invalid direction: ${dir}`;
            }
        }
    };
    constructor(name, data) {
        if (name)
            this.name = name;
        Object.assign(this.data, data);
    }
}
exports.Lang = Lang;
