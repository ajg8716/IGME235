class LifeGuard extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/LifeGuard.png"].texture);
        this.amchor.set(.5, .5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}