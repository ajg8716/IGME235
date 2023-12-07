class LifeGuard extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/LifeGuard.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Buoy extends PIXI.Sprite {
    constructor(radius, x=0, y=0){
        super(app.loader.resources["images/Buoy.png"].texture);
        this.radius = radius;
        this.anchor.set(.5, .5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}