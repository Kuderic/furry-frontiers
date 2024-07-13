import Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }
    loadAssets() {
        this.load.image("bunny1", new URL(`../../assets/images/bunny1.png`, import.meta.url).toString());
        this.load.image("bunny2", new URL(`../../assets/images/bunny2.png`, import.meta.url).toString());
        this.load.image("bunny3", new URL(`../../assets/images/bunny3.png`, import.meta.url).toString());
        this.load.image("wolf", new URL(`../../assets/images/wolf.png`, import.meta.url).toString());

        this.load.image("grass1", new URL(`../../assets/images/grass1.png`, import.meta.url).toString());

        this.load.image("furry-frontiers", new URL(`../../assets/images/furry-frontiers.png`, import.meta.url).toString());
        this.load.image("blue-button-medium", new URL(`../../assets/images/blue-button-medium.png`, import.meta.url).toString());
        this.load.image("blue-button-medium-pressed", new URL(`../../assets/images/blue-button-medium-pressed.png`, import.meta.url).toString());

        this.load.audio("background-music", new URL(`../../assets/sounds/background-music.mp3`, import.meta.url).toString());
        this.load.audio("shoot", new URL(`../../assets/sounds/shoot.wav`, import.meta.url).toString());
        this.load.audio("select", new URL(`../../assets/sounds/select.wav`, import.meta.url).toString());
    }


    preload() {
        // Load text first
        this.load.bitmapFont('rainyhearts',
            new URL('../../assets/fonts/rainyhearts-white_0.png', import.meta.url).toString(),
            new URL('../../assets/fonts/rainyhearts-white.fnt', import.meta.url).toString(), 
            () => {
                this.loadingText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 50,
                    'rainyhearts', 'Loading...', 48).setOrigin(0.5);
            });

        // Set the background color
        this.cameras.main.setBackgroundColor('#24252A');

        // Create a loading bar
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.centerX - 160, this.cameras.main.centerY - 30, 320, 50);

        // Load assets
        this.load.on('progress', (value) => {
            console.log("loading progress:", value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.centerX - 150, this.cameras.main.centerY - 20, 300 * value, 30);
        });

        // Create loading text after the font is fully loaded
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            this.scene.start('MainMenuScene');
        });

        this.loadAssets();
    }

    create() {
    }
}
