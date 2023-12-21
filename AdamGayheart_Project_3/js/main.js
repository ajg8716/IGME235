// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

const canvas = document.getElementById('mycanvas');

const app = new PIXI.Application({
    view: canvas,
    width: 1000,
    height: 800,
    resolution: 1,
    autoDensity: true,
});
document.body.appendChild(app.view);

// constants
let sceneWidth = 0;
let sceneHeight = 0;

// aliases
let stage;

// game variables
let startScene;
let lifeGuard;
let gameScene,scoreLabel,lifeLabel;
let gameOverScene;

let savedS, notSavedS, savePercent;

//sounds
let swimmer1Help;
let swimmer2Help;
let saved;
let hitBuoy;
let jetski;
let drown;

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

//trackers for saved and drowned swimmers
let savedSwimmers;
let drownedSwimmers;

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

console.log(app.renderer.width);
console.log(app.renderer.height);

    sceneHeight = app.view.height;
    console.log("sceneheight" + sceneHeight);
    sceneWidth = app.view.width;
    console.log("scenewidth" + sceneWidth);

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
    gameScene.addChildAt(lifeGuard, 1);

	// #6 - Load Sounds
    swimmer1Help = new Howl({
        src: ['sounds/swimmer1Help.mp3']
    });

    swimmer2Help = new Howl({
        src: ['sounds/swimmer2Help.mp3'],
        volume: 0.7,
    });
	
    saved = new Howl({
        src: ['sounds/saved.mp3'],
        volume: 0.7,
    });

    hitBuoy = new Howl({
        src: ['sounds/BellBuoy.mp3']
    });

    jetski = new Howl({
        src: ['sounds/jetski.mp3'],
        loop: true,
    });

    drown = new Howl({
        src: ['sounds/drown.mp3']
    })
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
    let startLabel2 = new PIXI.Text("Use your 'a' and 'd' keys to manuever Hurricane Bay as the\nbest lifeguard, Kyle Wavecrest, through treterous buoys\nto save stranded swimmers.\n\nYou'll need to get your jetski close enough so that Kyle\ncan throw the swimmers a life preserver");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        align: 'center',
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 160;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    //create the start button and add style to it
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = sceneWidth / 2;
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
    let gameOverText = new PIXI.Text("You Crashed the Jet Ski!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight - 500;
    gameOverScene.addChild(gameOverText);

    //create a saved statistic
    savedS = new PIXI.Text()
    savedS.style = new PIXI.TextStyle({
        align: 'center',
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    savedS.x = 100;
    savedS.y = sceneHeight - 400;
    gameOverScene.addChild(savedS);

    //create a not saved statistic
    notSavedS = new PIXI.Text()
    notSavedS.style = new PIXI.TextStyle({
        align: 'center',
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    notSavedS.x = 100;
    notSavedS.y = sceneHeight - 300;
    gameOverScene.addChild(notSavedS);

    //create a save percentage statistic
    savePercent = new PIXI.Text()
    savePercent.style = new PIXI.TextStyle({
        align: 'center',
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    savePercent.x = 100;
    savePercent.y = sceneHeight - 200;
    gameOverScene.addChild(savePercent);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    //make stats text
    let statsHeader = new PIXI.Text("Your Stats:")
    statsHeader.style = new PIXI.TextStyle({
        align: 'center',
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    statsHeader.x = 100;
    statsHeader.y = 600;
    gameOverScene.addChild(statsHeader);
}

//function that starts the game
function startGame(){
    console.log('start game called');
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    savedSwimmers = 0;
    drownedSwimmers = 0;
    life = 100;
    speed = 150;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    lifeGuard.x = 600;
    lifeGuard.y = 900;
    loadLevel();
}

//increase score by input value
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

//decreases life by input value
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}%`;
}

//what happens when swimmer is saved
function SaveSwimmer(swimmer){
    //if swimmer is a Swimmer1 class
    if(swimmer instanceof Swimmer1){
    //change swimmer texture to swimmer1.texture2
    swimmer.texture = app.loader.resources["images/Swimmer1saved.png"].texture;
    savedSwimmers++;
    }
    //else if swimmer is Swimmer2 class
    else if(swimmer instanceof Swimmer2){
    //change swimmer texture to swimmer2.texture2   
    swimmer.texture = app.loader.resources["images/Swimmer2saved.png"].texture;
    savedSwimmers++;
    console.log(savedSwimmers)
    }
}

//creates buoys
function createBuoys(numBuoys){
    for(let i=0; i<numBuoys; i++){
        let c = new Buoy(speed);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = 0 - c.height;
        buoys.push(c);
        gameScene.addChildAt(c, 1);
    }
}

//creates swimmers
function createSwimmers(numSwimmers){
    for(let i=0; i < numSwimmers; i++){
        //random float between 0 and 1
        let randomNumber = Math.random();
        let c;

        //random to determine if male swimmer or female swimmer
        if(randomNumber < 0.5){
            c = new Swimmer1(speed);
            swimmer1Help.play();
        }
        else if(randomNumber >= .5){
            c = new Swimmer2(speed);
            swimmer2Help.play();
        }

        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = 0 - c.height;
        swimmers.push(c);
        gameScene.addChildAt(c, 1);
    }
}

//create the background
function createWaves(){
    //create background
	background = new Waves(sceneWidth, sceneHeight);
    gameScene.addChildAt(background, 0);
}

//load level
function loadLevel(){
    createBuoys(1);
    createSwimmers(1);
    createWaves(sceneWidth, sceneHeight);
    paused = false;
    jetski.play();
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

//checks for key down
function keysDown(e){
    keys[e.keyCode] = true;
}

//checks for key up
function keysUp(e){
    keys[e.keyCode] = false;
}

function end(){
    gameOverScene.visible = true;
    gameScene.visible = false;
    
    //clear lists of buoys and swimmers
    buoys.forEach(c => gameScene.removeChild(c));
    buoys = [];

    swimmers.forEach(c => gameScene.removeChild(c));
    swimmers = [];

    //remove waves background
    gameScene.removeChild(background);

    //stop playing the jetski sound
    jetski.stop();


    //set speed to 0
    speed = 0;

    //update stats

    //saved stat
    savedS.text = `You Saved: ${savedSwimmers} Swimmers`;

    //lost stat
    notSavedS.text = `You Lost: ${drownedSwimmers} Swimmers`;

    //save percentage
    let savePercentage = [(savedSwimmers) / (savedSwimmers + drownedSwimmers)]*100;

    savePercent.text = `Your Save Percentage Is: ${savePercent}%`;
}

//function to do a collision check between two objects
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
    if(random <= .0025){
        createBuoys(1);
    }
    else if(random <= .0015){
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
            if(!s.isSaved){
                drown.play();
                drownedSwimmers ++;
                console.log(drownedSwimmers);
            }
        }
    }

    //move background
    background.move();
	
	// #5 - Check for Collisions
    //colliding with buoys
	for(let b of buoys){
        if(Colliding(b, lifeGuard)){
            if(!b.colliding){
                //hit sound.play();
            decreaseLifeBy(20);
            hitBuoy.play();
            b.colliding = true;
            //if the lifeguards position is to the left of the buoy
            if(lifeGuard.boundingBox.x <= b.boundingBox.x + b.boundingBox.width / 2){
                b.rotation = Math.PI / 10;
            }
            else if(lifeGuard.boundingBox.x > b.boundingBox.x + b.boundingBox.width / 2){
                b.rotation = -Math.PI / 10;

            }
            }
        }
        else{
            b.colliding = false;
            b.rotation = 0;
        }
    }

    //colliding with swimmers
    for(let s of swimmers){
        //if the swimmer collides with lifeGyard
        if(Colliding(s, lifeGuard)){
            //and it is not already colliding
            if(!s.colliding && !s.isSaved){
                increaseScoreBy(25);
                SaveSwimmer(s);
                s.colliding = true;
                s.isSaved = true;
                saved.play();
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
            //increase speed of background
            background.speed += 25;
            //set increasing speed to true
            increasingSpeed = true;
        }   
    }
    else{
        increasingSpeed = false;
    }

    //change z index of buoys so player can go under the top of it to show as if behind player
    for(let b of buoys){
        if(b.boundingBox.y >= lifeGuard.boundingBox.y + lifeGuard.boundingBox.height){
            //set index higher than player
            gameScene.removeChild(b);
            gameScene.addChildAt(b, 2);
        }
    }

	// #6 - Now do some clean up
    //filter out swimmers dead or off screen
	swimmers = swimmers.filter(s => s.isAlive);

    //filter out off screen buoys
    buoys = buoys.filter(b => b.isAlive);
	
	// #7 - Is game over?
	if (life <= 0){
        end();
        return;
    }
	
}