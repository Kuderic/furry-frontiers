import Phaser from "phaser";

// This scene is always active and overlayed over the game s cene
export default class GameUIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameUIScene'});
    }

    preload() {
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        // Create a UI camera
        // @ts-ignore
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        console.log();
        this.uiCamera = this.cameras.add(0, 0, width, height);
        this.uiCamera.setScroll(0, 0); // Make sure it does not move

        // FPS Counter
        // @ts-ignore
        this.fpsText = this.add.bitmapText(width - 150, 25, 'rainyhearts', '', 36);
        this.fpsText.setTint(0xffffff);
        // this.cameras.main.ignore(this.fpsText);

        // Adding a mute button
        this.muteButton = this.add.image(50, 50, 'mute').setInteractive().setDisplaySize(50,50);
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
        this.muteButton.setTexture(this.sound.mute ? 'unmute' : 'mute');
    }
}