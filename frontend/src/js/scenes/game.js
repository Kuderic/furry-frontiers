import Phaser from 'phaser';
import Player from '../utils/player';
import GrassGenerator from '../utils/grass-generator';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;
const MOBILE_ZOOM_SCALE = 0.7;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        if (this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }
        this.cameras.main.setBackgroundColor('#457237');
        this.isMobile = this.registry.get('isMobile');
        this.isMobile = true;
    }

    create() {
        this.setBounds();
        this.createMainPlayer();
        this.generateWorld();
        this.createGameUI();
        this.setUpCamera();
        this.addInput();

    }

    update() {
        this.updatePlayer();
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

    createMainPlayer() {
        this.player = new Player(this, 500, 500, "bunny1", this.registry.get('playerName'));
        this.player.setDisplaySize(150, 150);
        this.player.setSize(150, 150);
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
            throw new Error("no rex pluging loaded");
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
        this.input.on('pointerdown', (pointer) => {
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
        this.input.on('pointerup', (pointer) => {
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
            this.calculateKeyboardMovement();
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

    calculateKeyboardMovement() {
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
}
