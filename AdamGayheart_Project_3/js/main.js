// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

const canvas = document.getElementById('mycanvas');

const app = new PIXI.Application({
    view: canvas,
    width: 1000,
    height: 1100,
    resolution: window.devicePixelRatio,
    autoDensity: true,
});
document.body.appendChild(app.view);


window.addEventListener('resize', resize );

function resize(){
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    app.resize(screenWidth, screenHeight);
}

resize();

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
let swimmers = [];
let swimmersDanger = [];
let swimmersSaved = [];
let speed = 0;
let increasingSpeed = false;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

let background;

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
        'images/Swimmer2saved.png',
        'images/waves.png'
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

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
    gameScene.addChildAt(lifeGuard, 2);

	// #6 - Load Sounds
		
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
    speed = 200;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    lifeGuard.x = 600;
    lifeGuard.y = 900;
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

function SaveSwimmer(swimmer){
    //if swimmer is a Swimmer1 class
    if(swimmer instanceof Swimmer1){
    //change swimmer texture to swimmer1.texture2
    swimmer.texture = app.loader.resources["images/Swimmer1saved.png"].texture;
    }
    //else if swimmer is Swimmer2 class
    else if(swimmer instanceof Swimmer2){
    //change swimmer texture to swimmer2.texture2   
    swimmer.texture = app.loader.resources["images/Swimmer2saved.png"].texture;
    }
}

function createBuoys(numBuoys){
    for(let i=0; i<numBuoys; i++){
        let c = new Buoy(speed);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = 0 + 50;
        buoys.push(c);
        gameScene.addChildAt(c, 1);
    }
}

function createSwimmers(numSwimmers){
    for(let i=0; i < numSwimmers; i++){
        //random float between 0 and 1
        let randomNumber = Math.random();
        let c;

        //random to determine if male swimmer or female swimmer
        if(randomNumber < 0.5){
            c = new Swimmer1(speed);
        }
        else if(randomNumber >= .5){
            c = new Swimmer2(speed);
        }

        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = 0 + 50;
        swimmers.push(c);
        gameScene.addChildAt(c, 1);
    }
}

function createWaves(){
    //create background
	background = new Waves(speed, sceneWidth, sceneHeight);
    gameScene.addChildAt(background, 0);
}

function loadLevel(){
    createBuoys(1);
    createSwimmers(1);
    createWaves(speed, sceneWidth, sceneHeight);
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
    //clear lists of buoys and swimmers
    buoys.forEach(c => gameScene.removeChild(c));
    buoys = [];

    swimmers.forEach(c => gameScene.removeChild(c));
    swimmers = [];

    //remove waves background
    gameScene.removeChild(background);

    //set speed to 0
    speed = 0;

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function Colliding(a, b){
    if(a.boundingBox.x < b.boundingBox.x + b.boundingBox.width &&
        a.boundingBox.x + a.boundingBox.width > b.boundingBox.x &&
        a.boundingBox.y < b.boundingBox.y + b.boundingBox.height &&
        a.boundingBox.y + a.boundingBox.height > b.boundingBox.y){
        
        return true;
    }
    return false;
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
	
    //Create extra buoys
    let random = Math.random();
    if(random <= .0045){
        createBuoys(1);
    }
    else if(random <= .0035){
        createBuoys(2);
    }
    
	// #3 - Move buoys
    for(let c of buoys){
        let hb = c.height/2;
        c.move(dt);
        if(c.y >= sceneHeight+hb){
            c.isAlive = false;
            gameScene.removeChild(c);
        }
    }

    //random value to determine swimmer spawn
    random = Math.random();
    //create 1 swimmer if the random value is lower than .0025 for a .25% chance of spawn
    if(random <= 0.0025){
        createSwimmers(1);
    }
    //create 2 swimmers if the random value is lower than .0015 for a .15% chance of spawn
    else if(random <= .0015){
        createSwimmers(2);
    }


	// #4 - Move swimmers
    for(let s of swimmers){
        let hb = s.height/2;
        s.move(dt);
        if(s.y >= sceneHeight+hb){
            gameScene.removeChild(s);
            s.isAlive = false;
        }
    }

    //move background
    background.move();
	
	// #5 - Check for Collisions
	for(let c of buoys){
        if(Colliding(c, lifeGuard)){
            if(!c.colliding){
                //hit sound.play();
            decreaseLifeBy(20);
            c.colliding = true;
            }
        }
        else{
            c.colliding = false;
        }
    }

    //colliding with swimmers
    for(let s of swimmers){
        if(Colliding(s, lifeGuard)){
            if(!s.colliding && !s.isSaved){
                increaseScoreBy(25);
                SaveSwimmer(s);
                s.colliding = true;
                s.isSaved = true;
            }
        }
        else{
            s.colliding = false;
        }
    }
	
	//increase speed when score is divisible by 100
    if(score % 100 == 0){
        if(!increasingSpeed){
            //increase the speed variable for newly created objects
            speed += 50;
            console.log(speed);
            //increase speed of already created buoys
            for(let b of buoys){
                b.speed = speed;
            }
            //increase speed of already created swimmers
            for(let s of swimmers){
                s.speed = speed;
            }
            //increase speed of lifeGuard
            lifeGuard.speed += 1;
            //increase speed of background
            background.speed = speed;
            //set increasing speed to true
            increasingSpeed = true;
        }   
    }
    else{
        increasingSpeed = false;
    }

	// #6 - Now do some clean up
	swimmers = swimmers.filter(s => s.isAlive);

    buoys = buoys.filter(b => b.isAlive);
	
	// #7 - Is game over?
	if (life <= 0){
        end();
        return;
    }
	
}