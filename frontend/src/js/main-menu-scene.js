import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({key:'MainMenuScene'});
    }

    preload() {
        this.load.bitmapFont('rainyhearts-black', new URL('../assets/fonts/rainyhearts_0.png', import.meta.url).toString(),
            new URL('../assets/fonts/rainyhearts.fnt', import.meta.url).toString());
        this.load.bitmapFont('rainyheartswhite', new URL('../assets/fonts/rainyhearts-white_0.png', import.meta.url).toString(),
            new URL('../assets/fonts/rainyhearts-white.fnt', import.meta.url).toString());
    }

    create() {
        // Create the title
        this.titleText = this.add.bitmapText(this.cameras.main.centerX, 150,
            'rainyheartswhite', 'Furry Frontiers 😺', 64).setOrigin(0.5).setTint(0xc7e7fc);

        // Create the play button
        this.playButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, 'rainyheartswhite','Play', 48)
        this.playButton.setOrigin(0.5).setInteractive().setTint(0xc7e7fc);

        // Add click event for the play button
        this.playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
