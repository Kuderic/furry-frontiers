import Phaser from 'phaser';
import Character from './character';
import Attack from '../utils/attack';


export default class Player extends Character {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {any} name
     */
    constructor(scene, x, y, texture='bunny1', name) {
        if (name.toLowerCase().includes("wolf")) {
            texture = "wolf";
        }
        super(scene, x, y, texture, name);
        this.name = name;
        this.speed = 400;

        this.setDisplaySize(150, 150);
        this.setSize(150, 150);
        
        this.setBounce(0);

        // Create name tag
        this.nameTag = this.scene.add.bitmapText(x, y - 100, 'rainyhearts', name, 36).setOrigin(0.5);
        this.nameTag.setDepth(2);

        // // Create a graphics object for the bubble
        // this.bubble = scene.add.graphics();
        // this.bubble.fillStyle(0xffffff, 0.8);
        // // Draw the bubble (e.g., a simple rectangle or rounded rectangle)
        // this.bubble.fillRoundedRect(0, 0, 150, 50, 12);
        // this.bubble.setVisible(false);  // Initially hidden
        // // Create a text object for the message
        // this.bubbleText = scene.add.bitmapText(0, 0, 'rainyhearts', '', 24);
        // this.bubbleText.setVisible(false);
        // this.bubble.setDepth(10);
        // this.bubbleText.setDepth(11);
    }

    /**
     * @param {number} time The current timestamp.
     * @param {number} delta The delta time, in ms, elapsed since the last frame.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.updateNameTag();
    }

    updateNameTag() {
        this.nameTag.setPosition(this.x, this.y - 100);
    }

    destroy() {
        super.destroy();
        this.nameTag.destroy();
    }

    startNewAttack(direction = 0) {
        if (this.attacking == true) {
            return;
        }
        console.log(`${this.name} starting new attack`);

        this.attacking = true
        const attackDuration = 400; // duration in ms
        
        // Create a new Attack instance
        this.attackSprite = new Attack(this.scene, this, 'melee', {
            type: 'slash',
            direction: direction,
            follow: true,
            damage: 10,
            duration: attackDuration
        });

        // Timed callback to reset this.attacking to false
        this.scene.time.delayedCall(attackDuration, () => {
            this.attacking = false;
        });
    }
}