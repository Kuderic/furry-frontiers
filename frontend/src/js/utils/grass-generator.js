import Phaser from "phaser";

export default class GrassGenerator {
    /**
     * @param {any} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.numGrassTypes = 1;
    }

    generateGrass(density=0.000015) {
        const area = this.scene.physics.world.bounds.width * this.scene.physics.world.bounds.height;
        const numGrass = area * density;
        console.log (`randomly placing ${numGrass} patches of grass`);
        for (let i = 0; i < numGrass; i++) {
            const x = Phaser.Math.Between(0, this.scene.physics.world.bounds.width);
            const y = Phaser.Math.Between(0, this.scene.physics.world.bounds.height);
            const grassType = `grass${Phaser.Math.Between(1, this.numGrassTypes)}`; // Assuming you have 2 grass types
            const grass = this.scene.add.image(x, y, grassType);
            grass.setDisplaySize(400, 400);
            grass.setDepth(-1); // Set depth below the bunny layer
        }
    }
}