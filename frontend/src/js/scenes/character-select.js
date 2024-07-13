import Phaser from 'phaser';
import Button from '../utils/button.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({key:'CharacterSelectScene'});
    }

    preload() {
    }

    create() {
        // Add input field for character name
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'nameInput';
        nameInput.placeholder = 'Enter character name';
        document.body.appendChild(nameInput);

        // Create a button instance
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height / 2 + 75;
        this.add.existing(new Button(this, {
            x: x,
            y: y,
            text: 'Start',
            callback: () => this.startGame()
        }));
    }

    startGame() {
        const nameInput = document.getElementById('nameInput');

        if (nameInput) {
            // @ts-ignore
            this.registry.set('playerName', nameInput.value);
            // Start the game scene or handle the character name as needed
            this.scene.start('GameScene');
            document.body.removeChild(nameInput); // Remove input field after start
        } else {
            console.error('Name input not found!');
        }
    }
}
