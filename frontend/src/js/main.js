/// <reference types="phaser" />
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        this.load.image('logo', new URL('../assets/images/wolf.png', import.meta.url).toString());
    }

    create() {
        const logo = this.add.image(400, 800, 'logo')
        logo.displayWidth = 500;
        logo.displayHeight = 500;
        this.tweens.add({
            targets: logo,
            y: 400,
            duration: 2000,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });
    }

    update() {
    }
}

const phaser_config = {
    type: Phaser.AUTO,
    // parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.RESIZE,  // Adjust to RESIZE to have the canvas resize dynamically
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas in the parent
    },
    input: {
      activePointers: 3, // 2 is default for mouse + pointer, +1 is required for dual touch
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    fps: {
        min: 10,
        target: 165,
        forceSetTimeOut: false,
        deltaHistory: 5,
        panicMax: 120
    },
    transparent: true,
    scene: [GameScene]
};

const game = new Phaser.Game(phaser_config);
