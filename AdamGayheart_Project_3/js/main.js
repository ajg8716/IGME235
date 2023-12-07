// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

const app = new PIXI.Application({
    width: 1500,
    height: 1000
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// aliases
let stage;

// game variables
let startScene;
let lifeGuard;
let gameScene,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
let gameOverScene;

let buoys = [];
let swimmersDanger = [];
let swimmersSaved = [];
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

let colliding = false;

let keys = {};

//pre-load the images (this code works with PIXI v6)
app.loader.
    add([
        'images/Buoy.png',
        'images/LifeGuard.png',
        'images/Swimmer1.png',
        'images/Swimmer1saved.png',
        'images/Swimmer2.png',
        'images/Swimmer2saved.png'
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// // //pre-load the images (this code works with PIXI v7)
// let assets;
// loadImages();
// async function loadImages(){
// PIXI.Assets.addBundle('sprites', {
//   lifeguard: 'images/LifeGuard.png',
//   buoy: 'images/Buoy.png',
//   swimmer1danger: 'images/Swimmer1.png',
//   swimmer1saved: 'images/Swimmer1saved.png',
//   swimmer2danger: 'images/Swimmer2.png',
//   swimmer2saved: 'images/Swimmer2saved.png'
// });

// // assets = await PIXI.Assets.loadBundle('sprites');
// setup();
// }

function setup() {
	stage = app.stage;
	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
	
	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
	
	// #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
	
	// #5 - Create LifeGuard
    lifeGuard = new LifeGuard();
    gameScene.addChild(lifeGuard)
	
	// #6 - Load Sounds
	
	// #7 - Load sprite sheet
		
	// #8 - Start update loop
	app.ticker.add(gameLoop);
	// #9 - Start listening for click events on the canvas
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Futura"
    });

    //Create Title Label and style it
    let startLabel1 = new PIXI.Text("Hurricane Bay Rescue");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    //create start label and style it
    let startLabel2 = new PIXI.Text("Can You Save the Swimmers?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    //create the start button and add style to it
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.aplha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    //set up game scene
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    //make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    lifeGuard.x = 600;
    lifeGuard.y = 750;
    loadLevel();
}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}%`;
}

function createBuoys(numBuoys){
    for(let i=0; i<numBuoys; i++){
        let c = new Buoy(10);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 800) + 25;
        buoys.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel(){
    createBuoys(1);
    paused = false;
}

function moveLifeGuard(){
    //move right if hitting d key
    if(keys["68"]){
        lifeGuard.x += lifeGuard.speed;
        lifeGuard.rotation = Math.PI / 10;
    }
    //move left if hitting a key
    if(keys["65"]){
        lifeGuard.x -= lifeGuard.speed;
        lifeGuard.rotation = -Math.PI/ 10;
    }
    if(keys["65"] && keys["68"]){
        lifeGuard.rotation = 0;
    }
    else if(!keys["68"] && !keys["65"]){
        lifeGuard.rotation = 0;
    }

    lifeGuard.boundingBox.x = lifeGuard.x;
    lifeGuard.boundingBox.y = lifeGuard.y - lifeGuard.boundingBox.height;
}

function keysDown(e){
    keys[e.keyCode] = true;
}

function keysUp(e){
    keys[e.keyCode] = false;
}

function end(){
    buoys.forEach(c => gameScene.removeChild(c));
    buoys = [];

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function gameLoop(){
    if (paused) return; 
	
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if(dt > 1/12) dt=1/12;
	
	// #2 - Move jet ski
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    moveLifeGuard();
    let w2 = lifeGuard.width/2;
    let h2 = lifeGuard.height/2;
    lifeGuard.x = clamp(lifeGuard.x, 0+w2, sceneWidth-w2);
    lifeGuard.y = clamp(lifeGuard.y, 0+h2, sceneHeight-h2);
	
	// #3 - Move buoys
    for(let c of buoys){
        let hb = c.height/2;
        c.move(dt);
        if(c.y >= sceneHeight+hb){
            c.y = 0-hb;
            c.x = getRandom(0, sceneWidth);
        }
    }

	// #4 - Move swimmers

	
	// #5 - Check for Collisions
	for(let c of buoys){
        if(rectsIntersect(c.boundingBox,lifeGuard.boundingBox)){
            if(!colliding){
                //hit sound.play();
            decreaseLifeBy(20);
            colliding = true;
            }
        }
        else{
            colliding = false;
        }
    }
	
	// #6 - Now do some clean up
	
	
	// #7 - Is game over?
	if (life <= 0){
        end();
        return;
    }
	
	// #8 - Load next level
}