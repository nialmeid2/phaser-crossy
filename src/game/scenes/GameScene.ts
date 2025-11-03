import { GameObjects, Scene, Geom, Input } from 'phaser';
import { getScales, scaleThings } from '../utils/scaleThings';

interface Enemy {
    imgObj: GameObjects.Image;
    speed: number;
    direction: "up" | "down";
}

export class GameScene extends Scene {
    scaleX: number; scaleY: number; screenHeight: number; screenWidth: number;
    player: GameObjects.Image; treasure: GameObjects.Image; bg: GameObjects.Image;
    enemies: Enemy[];
    KeyForLeft?: Input.Keyboard.Key;
    KeyForRight?: Input.Keyboard.Key;
    KeyForUp?: Input.Keyboard.Key;
    KeyForDown?: Input.Keyboard.Key;
    frameCount: number;
    playerMaxSpeed: number;
    dragonMaxSpeed: number;
    currSpeed: number;
    playerAcceleration: number;
    record: number;
    score: number = 0;
    bounds: {
        up: number;
        down: number;
        right: number;
        left: number;
    };
    bgDimensions: {
        width: number;
        height: number;
    };
    pause: boolean;

    constructor() {
        super('Game');
    }


    init() {
        this.frameCount = 0;
        this.screenWidth = this.scale.width;
        this.screenHeight = this.scale.height;
        this.currSpeed = 0;
        this.playerMaxSpeed = 3;
        this.playerAcceleration = .1;
        this.dragonMaxSpeed = 4;
        this.enemies = [];
        this.pause = false;
        this.input.keyboard?.removeAllKeys();
        this.KeyForLeft = this.input.keyboard?.addKey('a');
        this.KeyForUp = this.input.keyboard?.addKey('w');
        this.KeyForDown = this.input.keyboard?.addKey('s');
        this.KeyForRight = this.input.keyboard?.addKey('d');

        const prevRecord = localStorage.getItem('record') || 0;
        this.record = +prevRecord;

    }

    preload() {
        this.load.image('background', 'background.png');
        this.load.image('player', 'player.png');
        this.load.image('enemy', 'dragon.png');
        this.load.image('treasure', 'treasure.png');
    }

    create() {


        this.bg = this.add.image(0, 0, 'background');
        this.bgDimensions = { width: this.bg.getBounds().width, height: this.bg.getBounds().height };

        const dims = getScales({ width: this.screenWidth, height: this.screenHeight }, this.bg.getBounds());
        this.scaleX = dims.x;
        this.scaleY = dims.y;


        this.treasure = this.add.image(0, this.screenHeight / 2, 'treasure');
        this.player = this.add.image(0, this.screenHeight / 2, 'player');


        const enemies = [] as GameObjects.Image[];
        const enemiesPos = [165, 325, 485];

        for (let i = 0; i < enemiesPos.length * 3; i++) {
            enemies.push(this.add.image(0, this.screenHeight / 2, 'enemy'));
            const initialY = Math.random() * 0.55 + 0.25;

            const posIndex = Math.floor(i / 3);
            enemies[i].setPosition(enemiesPos[posIndex] * this.scaleX, this.scaleY * (i % 2 == 0 ? initialY : .8 - initialY))
                .setFlipX(true);

            this.enemies.push({
                direction: i % 2 == 0 ? 'down' : 'up',
                imgObj: enemies[i],
                speed: this.dragonMaxSpeed
            })

        }

        this.bg.setOrigin(0, 0); // now, the origin is the top left
        this.player.setPosition(50 * this.scaleX, this.screenHeight / 2);

        this.treasure.x = 575 * this.scaleX;
        this.treasure.setScale(.5 * this.scaleX);

        this.bounds = {
            down: this.screenHeight * .8,
            up: this.screenHeight * .2,
            left: this.player.getBounds().width * .65,
            right: this.screenWidth * .9
        }

        scaleThings({ x: this.scaleX, y: this.scaleY }, [this.bg]);
        scaleThings({ x: this.scaleX, y: this.scaleY }, [this.player, ...enemies], .5)

        this.add.text(0, 0, ` Score: ${this.score * 100} `, {
            fontSize: 25 * this.scaleX,
            backgroundColor: 'rgba(33, 33, 33, .75)'
        })
        this.add.text(this.screenWidth, 0, ` Record: ${this.record * 100} `, {
            fontSize: 25 * this.scaleX,
            backgroundColor: 'rgba(33, 33, 33, .75)'
        }).setOrigin(1, 0)

        this.cameras.main.fadeIn(500);

    }

    update() {

        if (this.pause)
            return;

        this._startAccelerating();
        this._movePlayer();

        const playerRect = this.player.getBounds();
        const treasureRect = this.treasure.getBounds();

        playerRect.width *= .65;
        playerRect.height *= .65;

        for (let i = 0; i < this.enemies.length; i++) {

            this._doEnemyMovement(this.enemies[i]);

            const hitBox = this.enemies[i].imgObj.getBounds();
            hitBox.width *= .8;
            hitBox.height *= .8;

            if (Geom.Intersects.RectangleToRectangle(playerRect, hitBox)) {
                this._handleGameOver();

            }
        }

        playerRect.width *= .77;
        playerRect.height *= .77;

        if (Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
            this.pause = true;
            this.cameras.main.fadeOut(500);
            this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.score++;

                const prevRecord = localStorage.getItem('record') || 0;

                

                if (this.score > +prevRecord) {                    
                    localStorage.setItem(`record`, this.score + '');                    
                    this.record = this.score;
                }

                this.scene.restart();
            })
        }

    }

    _handleGameOver() {
        this.cameras.main.shake(400);
        this.cameras.main.on(Phaser.Cameras.Scene2D.Events.SHAKE_COMPLETE, () => {
            this.cameras.main.fadeOut(400);
            //this.scene.restart(); 
        }, this);
        this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {

            this.score = 0;
            this.scene.restart();
        }, this);
        this.pause = true;
    }


    _movePlayer() {
        let xSpeed = 0;
        let ySpeed = 0;

        if (this.KeyForRight?.isDown) {
            xSpeed += this.currSpeed;
        }
        if (this.KeyForLeft?.isDown) {
            xSpeed -= this.currSpeed;
        }
        if (this.KeyForUp?.isDown) {
            ySpeed -= this.currSpeed;
        }
        if (this.KeyForDown?.isDown) {
            ySpeed += this.currSpeed;
        }

        const nextY = ySpeed + this.player.y
        if (nextY <= this.bounds.up) {
            ySpeed = 0;
            this.player.y = this.bounds.up;
        }
        if (nextY >= this.bounds.down) {
            ySpeed = 0;
            this.player.y = this.bounds.down;
        }

        const nextX = xSpeed + this.player.x;
        if (nextX <= this.bounds.left) {
            xSpeed = 0;
            this.player.x = this.bounds.left;
        }
        if (nextX >= this.bounds.right) {
            xSpeed = 0;
            this.player.x = this.bounds.right;
        }

        


        if (xSpeed != 0 && ySpeed != 0) {
            
            const absoluteSpeed = Math.abs(xSpeed);
            const angle = Math.atan(ySpeed / xSpeed);

            // if the sppeds where different, I would need to find the angle first with atan
            // Math.atan(ySpeed / xSpeed)
            
            const finalSpeed = absoluteSpeed * Math.cos(angle); // math.sin for y and math.cos for x


            ySpeed = ySpeed < 0 ? -(finalSpeed) : (finalSpeed); 
            xSpeed = xSpeed < 0 ? -(finalSpeed) : (finalSpeed);
        }

        this.player.x += xSpeed;
        this.player.y += ySpeed;
    }

    _startAccelerating() {
        if (this.KeyForDown?.isDown || this.KeyForLeft?.isDown || this.KeyForUp?.isDown || this.KeyForRight?.isDown) {
            const nextSpeed = this.currSpeed + this.playerAcceleration;
            this.currSpeed = nextSpeed >= this.playerMaxSpeed ? this.playerMaxSpeed : nextSpeed;
        } else {
            this.currSpeed = 0
        }
    }

    _doEnemyMovement(theEnemy: Enemy) {
        const thePos = theEnemy.imgObj.y;

        if (theEnemy.direction == 'down') {
            const newOffset = thePos + theEnemy.speed;

            if (newOffset < this.screenHeight * .8)
                theEnemy.imgObj.y = thePos + theEnemy.speed;
            else {
                theEnemy.direction = 'up';
                theEnemy.speed = Phaser.Math.RND.between(this.dragonMaxSpeed * .7, this.dragonMaxSpeed * 1.25)
            }
        }

        if (theEnemy.direction == 'up') {
            const newOffset = thePos - theEnemy.speed;

            if (newOffset > this.screenHeight * .15)
                theEnemy.imgObj.y -= theEnemy.speed;
            else {
                theEnemy.direction = 'down'
                theEnemy.speed = Phaser.Math.RND.between(this.dragonMaxSpeed * .7, this.dragonMaxSpeed * 1.25)
            }
        }
    }



}

