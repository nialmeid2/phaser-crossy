import { Scene, GameObjects } from "phaser";
import { getScales, scaleThings } from "../utils/scaleThings";

interface Coordinates {
    x: number;
    y: number;
}

export class TitleScene extends Scene {

    proportions: Coordinates;
    clickToPlay: GameObjects.Text;
    frameCount: number;

    constructor() {
        super({
            key: 'TitleScene'
        })
    }

    init() {
        this.frameCount = 0;
    }

    preload() {
        this.load.image('title-background', 'title-background.png');
    }

    create() {
        const bg = this.add.image(0, 0, 'title-background');
        bg.setOrigin(0, 0);

        this.proportions = getScales(this.scale, bg.getBounds())

        scaleThings(this.proportions, [bg]);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - (50 * this.proportions.y), "Crossing Road Adventure", {
            fontSize: 28,
            fontStyle: 'bold',
        })
            .setOrigin(.5).setScale(this.proportions.x, this.proportions.y);

        this.clickToPlay = this.add.text(this.scale.width / 2, this.scale.height / 2 + (50 * this.proportions.y), "Click to play", {
            fontSize: 20,
        })
            .setOrigin(.5).setScale(this.proportions.x, this.proportions.y);

        this.cameras.main.fadeIn(500);
        this.input.once('pointerup', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('Game');
            })
        })

    }

    update() {  
            
        if (this.frameCount % 240 > 120)
            this.clickToPlay.style.setColor('transparent')
        else
            this.clickToPlay.style.setColor('#fff')

        this.frameCount++;
    }
}