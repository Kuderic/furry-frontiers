import Phaser from 'phaser';
import Player from '../utils/player';
import GrassGenerator from '../utils/grass-generator';
import NetworkManager from '../utils/network-manager';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;
const MOBILE_ZOOM_SCALE = 0.7;
const THROTTLE_INTERVAL = 100;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.players = {};
        this.lastSentTime = 0;
    }
    
    preload() {
    }

    async create() {
        if (this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }
        this.cameras.main.setBackgroundColor('#457237');
        this.isMobile = this.registry.get('isMobile');
        // this.isMobile = true;

        await this.createNetworkManager();
        this.setBounds();
        this.generateWorld();
        this.createGameUI();
        this.setUpCamera();
        this.addInput();
    }

    update() {
        this.updatePlayer();
    }

    async createNetworkManager() {
        this.networkManager = new NetworkManager();

        await this.networkManager.connect();

        this.sendNewPlayerMessage();

        this.networkManager.on('new_main_player', this.createNewMainPlayerHandler.bind(this));
        this.networkManager.on('update_players', this.updatePlayersHandler.bind(this));
        // this.networkManager.on('player_data', playerDataHandler.bind(this));
    }

    sendNewPlayerMessage() {
        console.log("Sending new player message");
        this.networkManager?.sendMessage('new_main_player', {
            name: this.registry.get('playerName')
        })
    }

    sendMovePlayerMessage() {
        console.log('sending move message');
        this.networkManager?.sendMessage('move_player', {
            x: this.player?.x,
            y: this.player?.y,
            velocity_x: this.player?.body?.velocity.x,
            velocity_y: this.player?.body?.velocity.y,
        })
    }

    setUpCamera() {
        // Make the camera zoom out more on mobile
        if (this.isMobile) {
            this.cameras.main.setZoom(MOBILE_ZOOM_SCALE);
        }
    }

    createGameUI() {
        this.scene.launch('GameUIScene');
        this.uiScene = this.scene.get('GameUIScene');
    }

    setBounds() {
        this.physics.world.bounds.width = WORLD_WIDTH;
        this.physics.world.bounds.height = WORLD_HEIGHT;
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} [name]
     * @param {string} [texture]
     */
    createMainPlayer(x, y, name, texture='bunny1') {
        console.log(x, y, name, texture='bunny1');
        this.player = new Player(this, x, y, texture, name);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    addKeyboardInput() {
        this.keys = this.input.keyboard?.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        })
    }

    generateWorld() {
        console.log("generating grass");
        this.grassGenerator = new GrassGenerator(this);
        this.grassGenerator.generateGrass();
    }

    addInput() {
        if (this.isMobile) {
            this.createJoySticks();
        } else {
            this.addKeyboardInput();
        }
    }

    createJoySticks() {
        const rexPlugin = this.plugins.get('rexvirtualjoystickplugin');
        if (!rexPlugin) {
            throw new Error("no rex plugin loaded");
        }
        const GameUIScene = this.scene.get('GameUIScene');

        this.movementJoyStick = rexPlugin.add(GameUIScene, {
            x: 100,
            y: GameUIScene.cameras.main.height - 125,
            radius: 40,
            forceMin: 0,
            base: GameUIScene.add.circle(0, 0, 40, 0x888888).setDepth(100).setAlpha(0.25),
            thumb: GameUIScene.add.image(0, 0, 'joystick').setDisplaySize(60, 60).setDepth(100).setAlpha(0.5),
        }).on('update', () => {}, this)
        
        this.shootJoyStick = rexPlugin.add(GameUIScene, {
            x: GameUIScene.cameras.main.width - 100,
            y: GameUIScene.cameras.main.height - 125,
            radius: 20,
            forceMin: 0,
            base: GameUIScene.add.circle(0, 0, 40, 0x888888, 0.5).setDepth(100).setAlpha(0.25),
            thumb: GameUIScene.add.image(0, 0, 'joystick').setDisplaySize(60, 60).setDepth(100).setAlpha(0.5),
        }).on('update', () => {}, this)

        // Move joysticks dynamically based on pointer-down
        this.input.on('pointerdown', (/** @type {{ x: number; y: any; }} */ pointer) => {
            if (pointer.x <= this.cameras.main.width * 0.6) {
              this.movementJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(0.5)
              this.movementJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(1)
            }
            if (pointer.x >= this.cameras.main.width * 0.6) {
              this.shootJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(0.5)
              this.shootJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(1)
            }
          })
        
        // Add transparency to joysticks on pointer-up
        this.input.on('pointerup', (/** @type {any} */ pointer) => {
            if (!this.movementJoyStick.force) {
                this.movementJoyStick.base.setAlpha(0.25)
                this.movementJoyStick.thumb.setAlpha(0.5)
            }
            if (!this.shootJoyStick.force) {
                this.shootJoyStick.base.setAlpha(0.25)
                this.shootJoyStick.thumb.setAlpha(0.5)
            }
        });
    }

    updatePlayer() {
        if (!this.player) {
            console.log("Waiting for player to be created");
            return;
        }
        this.handlePlayerMovement();
    }

    handlePlayerMovement() {
        if (!this.player) {
            throw new Error("no player");
        }
        this.player.setVelocity(0, 0);

        if (this.isMobile) {
            this.handleJoyStickInput();
        } else {
            this.handleKeyboardMovement();
        }

        const velocity = this.player.body?.velocity.length();

        if (velocity !== 0) {
            if (!this.movementSound || !this.movementSound.isPlaying) {
                this.movementSound = this.sound.add("grass-move", {loop : true});
                this.movementSound.play({volume:0.5});
            }
        } else {
            if (this.movementSound && this.movementSound.isPlaying) {
                this.movementSound.pause();
            }
        }

        if (velocity !== 0) {
            const currentTime = Date.now();
            if (currentTime - this.lastSentTime > THROTTLE_INTERVAL) {
                this.lastSentTime = currentTime;
                this.sendMovePlayerMessage();
            }
        }
    }

    handleJoyStickInput() { 
        // Joystick movement
        if (!this.isMobile) {
            console.log("can't handle joysticks on PC");
            return;
        }
        if (!this.player) {
            throw new Error("player not defined");
        }

        let forceX = 0
        let forceY = 0;

        if (this.movementJoyStick.forceX > 0) {
            forceX = Math.min(this.movementJoyStick.forceX / 100, 1);
        } else if (this.movementJoyStick.forceX < 0) {
            forceX = Math.max(this.movementJoyStick.forceX / 100, -1);
        }
        if (this.movementJoyStick.forceY > 0) {
            forceY = Math.min(this.movementJoyStick.forceY / 100, 1);
        } else if (this.movementJoyStick.forceY < 0) {
            forceY = Math.max(this.movementJoyStick.forceY / 100, -1);
        }
        // console.log(forceX, forceY);

        if (forceX || forceY) {
            this.player.setVelocityX(forceX * this.player.speed);
            this.player.setVelocityY(forceY * this.player.speed);
        }
    }

    handleKeyboardMovement() {
        if (!this.player) {
            throw new Error("no player");
        }
        if (this.input.keyboard) {
            if (this.keys.left.isDown) {
                this.player.setVelocityX(-1 * this.player.speed);
            }
            if (this.keys.right.isDown) {
                this.player.setVelocityX(this.player.speed);
            }
            if (this.keys.up.isDown) {
                this.player.setVelocityY(-1 * this.player.speed);
            }
            if (this.keys.down.isDown) {
                this.player.setVelocityY(this.player.speed);
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                  NETWORK CALLBACK METHODS
    ////////////////////////////////////////////////////////////////

    /**
     * @param {any} data
     */
    createNewMainPlayerHandler(data) {
        const player = this.createMainPlayer(data.player.x, data.player.y, data.player.name, 'bunny1');
        // @ts-ignore
        this.players[data.client_id] = player;
    }

    /**
     * @param {any} data
     */
    updatePlayersHandler(data) {
        // data.players is a dict with key:value where key is playerId and value is player data. 
        for (const playerId in data.players) {
            console.log(playerId);
            const playerData = data.players[playerId];
            console.log(playerData);

            // Check if the player already exists
            if (this.players[playerId]) {
                console.log(`UPDATING PLAYER ${playerData.name}`);
                // Update the existing player's position and other properties
                const player = this.players[playerId];
                player.x = playerData.x;
                player.y = playerData.y;
                player.setPosition(playerData.x, playerData.y);
                // Update other player properties as needed
            } else {
                console.log(`CREATING PLAYER ${playerData.name}`);
                // If the player does not exist, create a new player
                const newPlayer = new Player(this, playerData.x, playerData.y, 'bunny1', playerData.name);
                this.players[playerId] = newPlayer;
            }
        }
    }
}
