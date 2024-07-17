import Phaser from 'phaser';

export default class Particle extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {number} lifespan
     */
    constructor(scene, x, y, texture='particle', lifespan=100) {
        super(scene, x, y, texture);

        // add tween or animation for particle
    }
}
