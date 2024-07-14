import Phaser from 'phaser';
import { Character } from './character';


export default class Player extends Character {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {any} name
     */
    constructor(scene, x, y, texture='bunny1', name) {
        super(scene, x, y, texture, name);
        this.setDisplaySize(150, 150);
        this.setSize(150, 150);
        
        this.speed = 400;
        this.setBounce(0);
    }

    /**
     * @param {number} time The current timestamp.
     * @param {number} delta The delta time, in ms, elapsed since the last frame.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
}