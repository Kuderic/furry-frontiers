import Phaser from 'phaser';
import Character from './character';

export default class Attack extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {Character} character
     * @param {Object} config - Configuration object
     * @param {string} [config.type] - Type of attack
     * @param {number} [config.direction] - Direction of the attack
     * @param {boolean} [config.follow] - Whether the attack should follow the player
     * @param {number} [config.damage] - Damage value of the attack
     * @param {number} [config.duration] - Duration of the attack animation
     * @param {Object} [config.tween] - Tween configuration for the attack animation
     */
    constructor(scene, character, texture='melee', config = {}) {
        super(scene, 0, 0, texture);

        this.character = character;
        this.type = config.type || 'default';
        this.follow = config.follow || false;
        this.direction = config.direction || 0;
        this.damage = config.damage || 10;
        this.duration = config.duration || 500;
        this.tweenConfig = config.tween || null;

        this.offset = this.calculateOffset();
        this.setPosition(character.x + this.offset.x, character.y + this.offset.y, 3);
        this.setRotation(this.direction + 3.5);

        this.setTint(0xffffff);

        // Add to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Setup animation
        this.setupAnimation();

        // // Add to attack group for collision detection
        // this.attackGroup = scene.physics.add.group();
        // this.attackGroup.add(this);

        // // Listen for collision with enemies
        // this.setupCollision(scene);
        
        scene.sound.play('melee-attack', {volume : 0.8});
        
        // Timed callback to destroy this
        this.scene.time.delayedCall(this.duration, () => {
            this.destroy();
        });
    }

    /**
     * @param {number} time The current timestamp.
     * @param {number} delta The delta time, in ms, elapsed since the last frame.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.follow) {
            this.setPosition(this.character.x + this.offset.x, this.character.y + this.offset.y);
        }
    }

    calculateOffset() {
        // Calculate offset from parent
        const x = Math.cos(this.direction) * (this.character.displayWidth / 2 + this.displayWidth/3);
        const y = Math.sin(this.direction) * (this.character.displayHeight / 2 + this.displayHeight/3);
        return {x, y};
    }

    setupAnimation() {
        // Setup animation based on the config
        const frameNames = this.texture.getFrameNames();
        const numFrames = frameNames.length;
        const frameRate = numFrames / this.duration * 1000;

        this.anims.create({
            key: `${this.texture.key}_attack`,
            frames: this.anims.generateFrameNumbers(this.texture.key, { start: 0, end: numFrames - 1 }),
            frameRate: frameRate,
            repeat: -1
        });

        this.play(`${this.texture.key}_attack`);

        // Apply tween animation if specified in the config
        if (this.tweenConfig) {
            this.scene.tweens.add({
                targets: this,
                ...this.tweenConfig,
                duration: this.duration
            });
        }
    }

    setupCollision(scene) {
        // Setup collision detection with enemies
        scene.physics.add.overlap(this.attackGroup, scene.enemyGroup, this.handleCollision, null, this);
    }

    handleCollision(attack, enemy) {
        // Handle collision logic, apply damage to the enemy
        enemy.takeDamage(this.damage);
        attack.destroy(); // Destroy the attack object after collision
    }
}