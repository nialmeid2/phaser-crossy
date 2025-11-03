import { GameScene as MainGame } from './scenes/GameScene';
import { AUTO, Game, Scale, Types } from 'phaser';
import { TitleScene } from './scenes/TitleScene';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000', //'#6d851e',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },    
    scene: [
        TitleScene, MainGame
    ],
    
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
