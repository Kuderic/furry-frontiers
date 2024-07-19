import Phaser from 'phaser';

export default class Character extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {string} name
     */
    constructor(scene, x, y, texture, name) {
        super(scene, x, y, texture);
        this.name = name;
        this.attacking = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set some default physics properties if necessary
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);

        // // Create name tag
        // const nameTag = scene.add.bitmapText(x, y - 200, 'rainyhearts', name, 40).setOrigin(0.5);
        // this.scene = scene;
        // this.speed = 300;
        // this.nameTag = nameTag;

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

        // // Create health bar
        // this.healthBar = scene.add.graphics();
        // this.healthBar.setDepth(2);

        // this.drawHealthBar();
    }

    /**
     * @param {number} time The current timestamp.
     * @param {number} delta The delta time, in ms, elapsed since the last frame.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // this.nameTag.setPosition(this.x, this.y - 20);

        // if (this.bubble.visible) {
        //     // Keep the bubble positioned above the player
        //     this.bubbleText.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight / 2 - 60);

        //     this.bubble.setPosition(this.bubbleText.x - 5, this.bubbleText.y - 5);
        // }

        // this.drawHealthBar();
    }

    startNewAttack() {
    }

    // /**
    //  * @param {string | string[]} message
    //  */
    // say(message) {
    //     this.bubble.setVisible(true);
    //     this.bubbleText.setText(message);
    //     this.bubbleText.setVisible(true);
    //     console.log(this.bubble.visible);

    //     // Position the text within the bubble
    //     this.bubbleText.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight / 2 - 60);

    //     // Position the bubble around the text
    //     this.bubble.setPosition(this.bubbleText.x - 5, this.bubbleText.y - 5);  // Some padding

    //     this.scene.time.delayedCall(3800, () => {
    //         this.bubble.setVisible(false);
    //         this.bubbleText.setVisible(false);
    //     }, [], this);
    // }


    // drawHealthBar() {
    //     this.healthBar.clear();

    //     // Define the size and position of the health bar
    //     const barWidth = 100;
    //     const barHeight = 10;
    //     const barX = this.sprite.x - barWidth / 2;
    //     const barY = this.sprite.y - this.sprite.displayHeight / 2 - 30;

    //     // Calculate health bar width based on current Health
    //     const healthWidth = (this.currentHealth / this.maxHealth) * barWidth;

    //     // Draw the background (empty part of the health bar)
    //     this.healthBar.fillStyle(0xff0000, 0.5);
    //     this.healthBar.fillRect(barX, barY, barWidth, barHeight);

    //     // Draw the foreground (filled part of the health bar)
    //     this.healthBar.fillStyle(0x00ff00, 0.8);
    //     this.healthBar.fillRect(barX, barY, healthWidth, barHeight);
    // }
    
    // shootProjectile(targetX, targetY) {
    //     const direction = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, targetX, targetY);
    //     const p = new Projectile(this.scene, this.sprite.x, this.sprite.y, direction);
    //     console.log(p.sprite.body.velocity);
    // }

    // takeDamage(amount) {
    //     this.currentHealth -= amount;
    //     if (this.currentHealth < 0) this.currentHealth = 0;
    //     this.drawHealthBar();

    //     if (this.currentHealth <= 0) {
    //         this.destroy();
    //     }
    // }
}