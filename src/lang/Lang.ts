export class CommandLang {
	constructor (options?: Partial<CommandLang>) {
		Object.assign(this, options);
	}

	description?: string;
	usage?: string;
	subCommands?: Record<string, CommandLang>;
}

export class Lang {
	public readonly name: string = 'EN';

	public data: {
		logger: {
			info: string
			warn: string
			error: string
			success: string
		}
		login: {
			auth: string
			username: string
			password: string
			serverIP: string
			MCVersion: string
		}
		misc: {
			loading: string
			connection: string
			loggingIn: string
			loggedIn: string
		}
		commands: Record<string, CommandLang>
		infoMessages: {
			botMovingErr: string
			botLookingOrAttackingErr: string
			connectErr: string
			death: string
			invalidCmd: (cmd: string) => string
			nonVanillaCmd: string
			scriptOnlyCmd: string
			cantDigBlockAt: (x: number | string, y: number | string, z: number | string, err: Error) => string
			alreadyRunning: string
			alreadyBlockThere: string
			blockPlaceAdjErr: string
			yawPitchMaxErr: string
			yawPitchMinErr: string
			noInvToClose: string
			noContainerOpenRN: string
			noCmdProvided: string
		}
	} = {
			logger: {
				info: 'INFO',
				warn: 'WARN',
				error: 'ERR',
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
				loggedIn: 'Logged in'
			},
			commands: {
				exit: {
					description: 'Disconnect from the server',
					usage: undefined
				},
				reco: {
					description: 'Reconnect to server',
					usage: undefined
				},
				send: {
					description: 'Send a message in chat',
					usage: 'Usage: send <Message>'

				},
				position: {
					description: 'Show current position',
					usage: undefined
				},
				distance: {
					description: 'Show the distance between two points',
					usage: 'Usage: distance <X1> <Y1> <Z1> <X2> <Y2> <Z2>'

				},
				list: {
					description: 'List players connected to the server and their ping',
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
					description: 'Stop digging',
					usage: undefined
				},
				digMap: {
					description: 'A map where the bot always tries digging the blocks inside it',
					usage: 'Usage: digMap <Action: add|remove|clear|addfromto|show>',
					subCommands: {
						add: {
							description: 'Add a block\'s coordinates',
							usage: 'Usage: digMap.add <X> <Y> <Z>'
						},
						addspace: {
							description: 'Add all block\'s in inside the coordinates',
							usage: 'Usage: digMap.add <X1> <Y1> <Z1> <X2> <Y2> <Z2>'
						},
						remove: {
							description: 'Remove a block\'s coordinates',
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
					description: 'Move the player in seconds',
					usage: undefined
				},
				control: {
					description: 'Set a control state of the player',
					usage: 'Usage: control <Control: forward|back|left|right|jump|sneak> <State: true, false>'

				},
				follow: {
					description: 'Follow a player',
					usage: 'Usage: follow <EntityMatches:$name=pig|$name!=pig|...> <Range>. Range > 0'

				},
				smartFollow: {
					description: 'Same as follow but uses advanced pathfinding (bad with anti cheats)',
					usage: 'Usage: smartfollow <EntityMatches:$name=pig|$name!=pig|...> <Range>. Range > 0'

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
					usage: 'Usage: lookat <Player> <MaxReach> <MinReach> [Force:yes|y|no|n]. MaxReach > MinReach'

				},
				stopLook: {
					description: 'Stop looking',
					usage: undefined
				},
				inventory: {
					description: 'Inventory management',
					usage: 'Usage: inventory <ID:0|inventory|1|container> [Action:click|move|drop|dropall] [...Action Args]',
					subCommands: {
						click: {
							description: 'Click a slot in a container',
							usage: 'Usage: inventory.click <Slot>'
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
				botMovingErr: 'Cannot use this command while player is moving.',
				botLookingOrAttackingErr: 'Cannot use this command while player is attacking/looking at something.',
				connectErr: 'Could not connect to server.',
				death: 'You died. Respawning...',
				invalidCmd (cmd) {
					return `'${cmd}' is not a valid command`;
				},
				nonVanillaCmd: 'This command uses some non-vanilla features to work which may get you banned on some servers. You can enable it in the configuration',
				scriptOnlyCmd: 'This command can only be used inside scripts',
				cantDigBlockAt (x, y, z, err) {
					return `Bot cannot dig block at ${x}, ${y}, ${z}.\n${(err).message}`;
				},
				alreadyRunning: 'Already ran this command',
				alreadyBlockThere: 'There\'s already a block there',
				blockPlaceAdjErr: 'There should be a block right next to where you would place the block',
				yawPitchMaxErr: 'Yaw or Pitch cannot be more than 90 deg',
				yawPitchMinErr: 'Yaw or Pitch cannot be less than -90 deg',
				noInvToClose: 'There is nothing to close',
				noContainerOpenRN: 'There is no container opened right now',
				noCmdProvided: 'No command provided'
			}
		};

	constructor (name?: Lang['name'], data?: Partial<Lang['data']>) {
		if (name) this.name = name;
		Object.assign(this.data, data);
	}
}
