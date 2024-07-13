import Phaser from 'phaser';
import Player from '../utils/player';
import GrassGenerator from '../utils/grass-generator';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        this.cameras.main.setBackgroundColor('#457237');
        this.generateWorld();
        this.physics.world.bounds.width = WORLD_WIDTH;
        this.physics.world.bounds.height = WORLD_HEIGHT;
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    create() {
        this.addInput();

        this.grassGenerator = new GrassGenerator(this);
        this.grassGenerator.generateGrass();

        this.createMainPlayer();
    }

    update() {
    }

    createMainPlayer() {
        let player = new Player(this, 500, 500, "bunny1", this.registry.get('playerName'));
        player.setDisplaySize(150, 150);
        player.setSize(150, 150);
        this.player = player;
        this.cameras.main.startFollow(player, true, 0.1, 0.1);
    }

    addInput() {
        this.keys = this.input.keyboard?.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        })
    }

    generateWorld() {
        console.log("generating world");
    }
}
