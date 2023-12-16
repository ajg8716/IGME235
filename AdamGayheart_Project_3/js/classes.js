class Waves extends PIXI.TilingSprite{
    constructor(speed, width, height){
        super(app.loader.resources["images/waves.png"].texture, width, height);
        this.position.set(0,0);
        this.rotation = 0;
        this.speed = speed;
        this.fwd = getUnitVector();
        stage.addChild(this);
    }

    move(dt=1/60){
        //move the waves
        this.tilePosition.y -= this.fwd.y * this.speed * dt;
    }
}

class LifeGuard extends PIXI.Sprite{
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/LifeGuard.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.rotation = 0;
        this.x = x;
        this.y = y;
        this.speed = 10;
        
        this.boundingBox = new PIXI.Rectangle(this.x-15, this.y-120, 110, 230);

        //DRAWING COLLISION BOXES
        // let box = new PIXI.Graphics();
        // box.lineStyle(1, 0xFF0000);
        // box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height)
        // this.addChild(box);
    }
}

class Buoy extends PIXI.Sprite{
    constructor(speed, x=0, y=0){
        super(app.loader.resources["images/Buoy.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.rotation = 0;
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = speed;
        this.isAlive = true;
        this.isSaved = false;

        this.boundingBox = new PIXI.Rectangle(this.x-50, this.y+30, 110, 110);

        //DRAWING COLLISION BOXES
        // let box = new PIXI.Graphics();
        // box.lineStyle(1, 0xFF0000);
        // box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height)
        // this.addChild(box);
    }

    move(dt=1/60){
        //move the buoy
        this.y -= this.fwd.y * this.speed * dt;

        //move the bounding box
        this.boundingBox.x = this.x - this.boundingBox.width / 2;
        this.boundingBox.y = this.y - this.boundingBox.height;
    }
}

class Swimmer1 extends PIXI.Sprite{
    constructor(speed, x=0, y=0){
        super(app.loader.resources["images/Swimmer1.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = speed;
        this.isAlive = true;
        this.isSaved = false;

        this.boundingBox = new PIXI.Rectangle(-150, -150, 300, 300);

        //DRAWING COLLISION BOXES
        // let box = new PIXI.Graphics();
        // box.lineStyle(1, 0xFF0000);
        // box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        // this.addChild(box);
    }

    move(dt=1/60){
        //move the swimmer
        this.y -= this.fwd.y * this.speed * dt;

        //move the bounding box
        this.boundingBox.x = this.x - this.boundingBox.width / 2;
        this.boundingBox.y = this.y - this.boundingBox.height;
    }

    changeSprite(texture){
        this.texture = texture;
    }
}

class Swimmer2 extends PIXI.Sprite{
    constructor(speed, x=0, y=0){
        super(app.loader.resources["images/Swimmer2.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = speed;
        this.isAlive = true;

        this.boundingBox = new PIXI.Rectangle(-150, -150, 300, 300);

        //DRAWING COLLISION BOXES
        // let box = new PIXI.Graphics();
        // box.lineStyle(1, 0xFF0000);
        // box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        // this.addChild(box);
    }

    move(dt=1/60){
        //move the buoy
        this.y -= this.fwd.y * this.speed * dt;

        //move the bounding box
        this.boundingBox.x = this.x - this.boundingBox.width / 2;
        this.boundingBox.y = this.y - this.boundingBox.height;
    }

    changeSprite(texture){
        this.texture = texture;
    }
}