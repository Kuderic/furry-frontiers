import Phaser from 'phaser';

export default class Button extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config - Configuration object for the button
     * @param {number} config.x - The x position of the button
     * @param {number} config.y - The y position of the button
     * @param {number} [config.width=100] - The width of the button
     * @param {number} [config.height=50] - The height of the button
     * @param {string} [config.text="Button"] - The text of the button
     * @param {string} [config.img="blue-button-medium"] - The image of the button
     * @param {string} [config.imgPressed="blue-button-medium-pressed"] - The image of the button when pressed
     * @param {() => void} config.callback - The callback function when the button is clicked
     */
    constructor(scene, { x, y, width = 100, height = 50, text = "Button",
        img = "blue-button-medium", imgPressed = "blue-button-medium-pressed", callback }) {

        super(scene, x, y);

        // Create button background images
        this.buttonUp = scene.add.image(0, 0, img);
        this.buttonDown = scene.add.image(0, 0, imgPressed);
        this.buttonDown.setVisible(false);

        // Add button text
        this.buttonText = scene.add.bitmapText(0, 0, 'rainyhearts', text, 24);
        this.buttonText.setOrigin(0.5);

        // Scale everything
        this.buttonUp.setDisplaySize(width, height);
        this.buttonDown.setDisplaySize(width, height);
        // this.setDisplaySize(width, height);
        this.setSize(width, height);

        // Add background images and text to the container
        this.add(this.buttonUp);
        this.add(this.buttonDown);
        this.add(this.buttonText);

        // Enable input on the button
        // this.displayWidth = width;
        // this.displayHeight = height;
        this.setSize(width, height);
        this.setInteractive();

        // Change cursor on hover
        this.on('pointerover', () => {
            scene.input.setDefaultCursor('pointer');
        });

        this.on('pointerout', () => {
            this.setPressedAnimation(false);
            scene.input.setDefaultCursor('default');
        });

        // Add click event
        this.on('pointerdown', () => {
            this.setPressedAnimation(true);
        });

        this.on('pointerup', () => {
            scene.sound.play('select', {volume : 0.25});
            scene.input.setDefaultCursor('default');
            this.setPressedAnimation(false);
            callback();
        });
    }

    /**
     * @param {boolean} isPressed
     */
    setPressedAnimation(isPressed) {
        if (isPressed) {
            this.buttonUp.setVisible(false);
            this.buttonDown.setVisible(true);
        } else {

            this.buttonUp.setVisible(true);
            this.buttonDown.setVisible(false);
        }
    }
}
