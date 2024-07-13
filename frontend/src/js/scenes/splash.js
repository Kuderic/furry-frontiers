import Phaser from 'phaser';

export default class SplashScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SplashScene' });
    }

    preload() {
        // Load any assets needed for the splash screen
        this.load.image('logo', new URL('../assets/logo.png', import.meta.url).toString());
    }

    create() {
        // Display the logo
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo').setOrigin(0.5);

        // Transition to the loading scene after a delay
        this.time.delayedCall(3000, () => {
            this.scene.start('LoadingScene');
        });
    }
}
