class Waves extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(app.loader.resources["images/waves.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.rotation = 0;
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = 200;
    }

    move(dt=1/60){
        //move the buoy
        this.y -= this.fwd.y * this.speed * dt;
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
        
        this.boundingBox = new PIXI.Rectangle(-20, -150, 114, 290);

        let box = new PIXI.Graphics();
        box.lineStyle(1, 0xFF0000);
        box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height)
        this.addChild(box);
    }
}

class Buoy extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(app.loader.resources["images/Buoy.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = 200;
        this.isAlive = true;

        this.boundingBox = new PIXI.Rectangle(-53, +30, 115, 110);

        let box = new PIXI.Graphics();
        box.lineStyle(1, 0xFF0000);
        box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height)
        this.addChild(box);
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
    constructor(x=0, y=0){
        super(app.loader.resources["images/Swimmer1.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = 200;
        this.isAlive = true;

        this.boundingBox = new PIXI.Rectangle(-150, -150, 300, 300);

        let box = new PIXI.Graphics();
        box.lineStyle(1, 0xFF0000);
        box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        this.addChild(box);
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
    constructor(x=0, y=0){
        super(app.loader.resources["images/Swimmer2.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.fwd = getUnitVector();
        this.speed = 200;
        this.isAlive = true;

        this.boundingBox = new PIXI.Rectangle(-150, -150, 300, 300);

        let box = new PIXI.Graphics();
        box.lineStyle(1, 0xFF0000);
        box.drawRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        this.addChild(box);
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