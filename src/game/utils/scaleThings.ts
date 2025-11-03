

export function scaleThings(theScale: {x: number, y: number}, who: Phaser.GameObjects.Image[], howMuch = 1) {
    for (let i = 0; i < who.length; i++)
        who[i].setScale(theScale.x * howMuch, theScale.y * howMuch);
}

export function getScales(screenDimensions: {width: number, height: number}, bgDimensions: {width: number, height: number}) {    
    return {
        x: screenDimensions.width / bgDimensions.width,
        y: screenDimensions.height / bgDimensions.height
    }
}