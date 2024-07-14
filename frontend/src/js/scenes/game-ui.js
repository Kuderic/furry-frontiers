import Phaser from "phaser";
import GameScene from "./game";

// This scene is always active and overlayed over the game s cene
export default class GameUIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameUIScene'});
    }

    preload() {
        this.minimapWidth = 200;
        this.minimapHeight = 200;
        this.minimapZoomScale = 0.1;
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
        
        this.createMinimapCamera();
    }

    createMinimapCamera() {
        if (!this.gameScene || !this.gameScene.cameras) {
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