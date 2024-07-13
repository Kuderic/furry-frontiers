import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
    }

    create() {
        const logo = this.add.image(400, 800, 'wolf')
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
