import Phaser from "phaser";
import GameScene from "./game";

// This scene is always active and overlayed over the game s cene
export default class GameUIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameUIScene'});
        this.minimapWidth = 200;
        this.minimapHeight = 200;
        this.minimapZoomScale = 0.1;
    }

    preload() {
    }

    create() {
        // Use JSDoc type assertion to tell TypeScript that this.scene.get('GameScene') returns a GameScene object
        // so it stops bitching
        this.gameScene = /** @type {GameScene} */ (this.scene.get('GameScene'));

        // Create a UI camera
        // @ts-ignore
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        this.uiCamera = this.cameras.add(0, 0, width, height);
        this.uiCamera.setScroll(0, 0);

        // FPS Counter
        // @ts-ignore
        this.fpsText = this.add.bitmapText(0, 0, 'rainyhearts', '', 36);
        this.fpsText.setTint(0xffffff);

        this.muteButton = this.add.image(50, 50, 'unmute')
        this.muteButton.setInteractive({ useHandCursor: true });
        this.muteButton.setDisplaySize(50,50);

        this.muteButton.on('pointerup', () => {
            this.toggleSound();
        });

        // Set the cursor to 'pointer' when hovering over an interactive object
        this.muteButton.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
        });

        // Revert the cursor to 'default' when not hovering over the object
        this.muteButton.on('pointerout', () => {
            this.input.setDefaultCursor('default');
        });

        // Add resize event listener
        window.addEventListener('resize', this.resizeUI.bind(this));

        // if (!this.registry.get('isMobile')) {
        //     // EXP Bar
        //     this.expBar = this.CreateLineExpBar()
        //     .setPosition(200, 150)
        //     .layout()
        //     .on('levelup.start', function (/** @type {any} */ level) {
        //         console.log('levelup.start', level)
        //     })
        //     .on('levelup.end', function (/** @type {any} */ level) {
        //         console.log('levelup.end', level)
        //     })
        //     .on('levelup.complete', function () {
        //         console.log('levelup.complete')
        //     })
        // }
    }

    createMinimapCamera() {
        console.log("creating minimap camera");
        if (!this.gameScene) {
            throw new Error("Main game scene or its cameras are not available.")
        }
        const canvasWidth = this.game.canvas.width;
        const canvasHeight = this.game.canvas.height;

        // VERY IMPORTANT: ADD CAMERA TO THE GAME SCENE, NOT THIS SCENE
        this.minimapCamera = this.gameScene.cameras.add(
            canvasWidth - this.minimapWidth - 10, // x position (10px padding from right)
            10,                        // y position (10px padding from top)
            this.minimapWidth,
            this.minimapHeight
        );
        this.minimapCamera.setZoom(this.minimapZoomScale);
        this.minimapCamera.setBackgroundColor(0x002244);
        
        if (this.gameScene.player) {
            this.minimapCamera.startFollow(this.gameScene.player, true);
        } else {
            console.error("Player is not available in the GameScene.");
        }
    }
    CreateLineExpBar() {
        const COLOR_PRIMARY = 0x9965cc;
        const COLOR_LIGHT = 0xeeeeee;
        const COLOR_DARK = 0x260e34;

        return this.rexUI.add.expBar({
            width: 250,
    
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY),
    
            icon: this.add.rectangle(0, 0, 20, 20, COLOR_LIGHT),
            nameText: this.add.bitmapText(0, -30, 'rainyhearts', 'Exp', 24).setTint(0xffffff),
            valueText: this.rexUI.add.BBCodeText(0, -30, '', { fontSize: 24 }),
            valueTextFormatCallback: function (/** @type {number} */ value, /** @type {any} */ min, /** @type {any} */ max) {
                value = Math.floor(value);
                return `[b]${value}[/b]/${max}`;
            },
    
            bar: {
                height: 6,
                barColor: COLOR_LIGHT,
                trackColor: COLOR_DARK,
                // trackStrokeColor: COLOR_LIGHT
            },
    
            align: {
            },
    
            space: {
                left: 20, right: 20, top: 20, bottom: 20,
                icon: 10,
                bar: -10
            },
    
            levelCounter: {
                table: function (/** @type {number} */ level) {
                    return level * 100;
                },
                maxLevel: 10,
    
                exp: 330,
            },
    
            easeDuration: 2000
    
        })
    }
    
    resizeUI() {
        const canvasWidth = this.game.canvas.width;
        const canvasHeight = this.game.canvas.height;
        this.uiCamera?.setSize(canvasWidth, canvasHeight);

        // Reposition and resize UI elements as needed
        this.fpsText?.setPosition(25, 25);
        this.muteButton?.setPosition(50, 50);
        this.minimapCamera?.setViewport(canvasWidth - this.minimapWidth - 10, 10, this.minimapWidth, this.minimapHeight);
    }

    update() {
        if (this.fpsText) {
            this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(0));

        }
    }
    
    toggleSound() {
        if (!this.gameScene || !this.muteButton) {
            throw new Error("no gamescene or mute button");
        }
        this.gameScene.sound.mute = !this.gameScene.sound.mute;
        this.muteButton.setTexture(this.sound.mute ? 'mute' : 'unmute');
    }
}