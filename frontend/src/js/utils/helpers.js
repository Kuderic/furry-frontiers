import Phaser from 'phaser';

/**
 * @param {{ text: { setOrigin: (arg0: number) => void; }; add: { bitmapText: (arg0: any, arg1: any, arg2: string, arg3: any, arg4: any) => any; }; }} scene
 * @param {any} x
 * @param {any} y
 * @param {any} text
 * @param {any} fontSize
 */
export function createText(scene, x, y, text, fontSize) {
    // Add text
    scene.text = scene.add.bitmapText(x, y, 'rainyhearts', text, fontSize);
    scene.text.setOrigin(0.5);

    return scene.text
}
