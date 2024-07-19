import Phaser from 'phaser';

export default class Attack extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config - Configuration object
     * @param {string} config.type - Type of attack
     * @param {number} config.damage - Damage value of the attack
     * @param {number} config.duration - Duration of the attack animation
     * @param {Object} config.tween - Tween configuration for the attack animation
     */
    constructor(scene, x, y, texture='melee', config) {
        super(scene, x, y, texture);
        
        this.type = config.type || 'default';
        this.damage = config.damage || 10;
        this.duration = config.duration || 1000;
        this.tweenConfig = config.tween || {};

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
                duration: this.duration,
                onComplete: () => {
                    this.destroy(); // Destroy the attack object after the animation completes
                }
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