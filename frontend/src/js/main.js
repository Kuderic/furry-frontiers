import Phaser from 'phaser';

import LoadingScene from './scenes/loading.js';
import MainMenuScene from './scenes/main-menu.js';
import GameScene from './scenes/game.js';

const phaser_config = {
    type: Phaser.WEBGL,
    scene: [LoadingScene, MainMenuScene, GameScene],
    // parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.RESIZE,  // Adjust to RESIZE to have the canvas resize dynamically
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas in the parent
    },
    input: {
      activePointers: 3, // 2 is default for mouse + pointer, +1 is required for dual touch
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    fps: {
        min: 10,
        target: 165,
        forceSetTimeOut: false,
        deltaHistory: 5,
        panicMax: 120
    },
    transparent: true
}

const game = new Phaser.Game(phaser_config);

// Log the renderer type
console.log(`Renderer used: ${game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'}`);
