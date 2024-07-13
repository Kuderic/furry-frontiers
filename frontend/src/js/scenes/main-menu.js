import Phaser from 'phaser';
import Button from '../utils/button.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({key:'MainMenuScene'});
    }

    preload() {
    }

    create() {
        if (this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }
        // Create the background
        this.bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'furry-frontiers').setOrigin(0.5);

        // Scale the background
        this.scaleBackground();

        new Button(this, {
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY + 50,
            text: 'Play',
            callback: () => {this.scene.start('CharacterSelectScene');}
        });

    }

    resize() {
        console.log("window resized");
        this.scaleBackground();
    }

    scaleBackground() {
        if (!this.bg) {
            return;
        }
        console.log(`camera height: ${this.cameras.main.height} | bg height: ${this.bg.displayHeight}`)
        const scale = this.cameras.main.height / this.bg.displayHeight;
        this.bg.setScale(scale);
        this.bg.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
    }
}
