import Phaser from 'phaser';

import LoadingScene from './scenes/loading.js';
import MainMenuScene from './scenes/main-menu.js';
import GameScene from './scenes/game.js';
import CharacterSelectScene from './scenes/character-select.js';
import GameUIScene from './scenes/game-ui.js';

const phaser_config = {
    type: Phaser.WEBGL,
    parent: 'gameContainer',
    scene: [LoadingScene, MainMenuScene, CharacterSelectScene, GameScene, GameUIScene],
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
        deltaHistory: 2,
        panicMax: 120
    },
    transparent: true
}

const game = new Phaser.Game(phaser_config);

let isMobile = false;
if (game.device.os.android || game.device.os.iOS) {
    isMobile = true;
} else {
    isMobile = false;
}
game.registry.set('isMobile', isMobile);

console.log(`Is Mobile? ${isMobile}`);
console.log(`Renderer used: ${game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'}`);
