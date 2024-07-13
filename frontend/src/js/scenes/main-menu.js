import Phaser from 'phaser';
import Button from '../utils/button.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({key:'MainMenuScene'});
    }

    preload() {
    }

    create() {
        // Create the background
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'furry-frontiers').setOrigin(0.5);

        this.add.existing(new Button(this, {
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY + 50,
            text: 'Play',
            callback: () => {this.scene.start('CharacterSelectScene');}
        }));
    }
}
