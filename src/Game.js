import { GameObjectContainer } from "./object/GameObjectContainer.js"
import planck from "planck-js"

export class Game extends GameObjectContainer {

    constructor(canvas, width, height, pixeltoUnitRatio) {
        super();
        this._canvas = canvas;
        this._screenWidth = width;
        this._screenHeight = height;
        this._scaleRatio = pixeltoUnitRatio;
        this._screenSizeRatio = width / height;

        this._lastRender = 0;
        this._timeDelta = 0;

        // Game screen offset in pixels
        this._offsetX = 0;
        this._offsetY = 0;

        // Offset in world coords
        this._drawX = 0;
        this._drawY = 0;

        // Ratios for converting canvas pixels to screen pixels
        this._canvasWidthRatio = 0;
        this._canvasHeightRatio = 0;

        this.resize();
        window.onresize = this.resize.bind(this);

        this._mouseX = 0;
        this._mouseY = 0;

        canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

        this._world = planck.World(planck.Vec2(0.0, -9.8));

        this._world.on('remove-fixture', function(fixture) {
            console.log(fixture);
        });

        this._hoveredObject = null;
        this._clickedObject = null;

        // Listen for all events fired
        for(var key in canvas){
            if(key.search('on') === 0) {
                canvas.addEventListener(key.slice(2), function(e) {
                    //console.log(e)
                })
            }
        }
        
    }

    get world() {
        return this._world;
    }

    get timeDelta() {
        return this._timeDelta;
    }

    get scaleRatio() {
        return this._scaleRatio;
    }

    get screenWidth() {
        return this._screenWidth;
    }

    get screenHeight() {
        return this._screenHeight;
    }

    get mouseX() {
        return this._mouseX;
    }

    get mouseY() {
        return this._mouseY;
    }

    get drawX() {
        return this._drawX;
    }

    get drawY() {
        return this._drawY;
    }

    set cursor(cursor) {
        this._canvas.style.cursor = cursor;
    }

    worldCoordToScreen(p) {
        return {
            x: p.x / this._scaleRatio,
            y: p.y / this._scaleRatio
        };
    }

    screenCoordToWorld(p) {
        return {
            x: p.x * this._scaleRatio,
            y: p.y * this._scaleRatio
        };
    }

    canvasToScreenPoint(p) {
        return {
            x: (p.x / this._canvasWidthRatio) - this._offsetX,
            y: (p.y / this._canvasHeightRatio) - this._offsetY
        }
    }


    handleMouseMove(e) {

        var p = this.canvasToScreenPoint({
            x: e.clientX,
            y: this._canvas.clientHeight - e.clientY
        })

        this._mouseX = p.x;
        this._mouseY = p.y;

        if (this._clickedObject !== null && this._clickedObject.onDrag !== undefined && this._clickedObject.onDrag !== null) {

            this._clickedObject.onDrag(this);
        }

    }

    handleMouseDown(e) {
        console.log("mouse down")

        if (this._hoveredObject !== null) {
            this._clickedObject = this._hoveredObject;

            var physicsBody = this._clickedObject.getComponent("physicsbody");
            if (physicsBody !== null) {
                physicsBody.forcePos = true;
            }

            if (this._hoveredObject.onMouseDown !== undefined && this._hoveredObject.onMouseDown !== null) {
                this._hoveredObject.onMouseDown(this);
            }
        }

    }

    handleMouseUp(e) {

        if (this._clickedObject !== null ) {

            var physicsBody = this._clickedObject.getComponent("physicsbody");
            if (physicsBody !== null) {
                physicsBody.forcePos = false;
            }

            if (this._clickedObject === this._hoveredObject && this._clickedObject.onClick !== undefined && this._clickedObject.onClick !== null) {
                this._clickedObject.onClick(this);
            }
        }

        this._clickedObject = null;

        console.log("mouseu p")
        if (this._hoveredObject !== null && this._hoveredObject.onMouseUp !== undefined && this._hoveredObject.onMouseUp !== null) {
            this._hoveredObject.onMouseUp(this);
        }

    }

    process(timestamp) {
        
        // Get time between frames
        this._timeDelta = timestamp - this._lastRender

        if (!this._timeDelta instanceof Number) {
            this._lastRender = 0;
            return;
        }

        if (this._lastRender == 0) {
            this._lastRender = timestamp;
            window.requestAnimationFrame(this.process.bind(this))
            return;
        }

        this.cursor = "default";

        this._hoveredObject = null;
        this._children.forEach((child) => {

            var collider = child.getComponent("collider");
            var worldMouse = this.screenCoordToWorld({x: this._mouseX, y: this._mouseY});

            // Mouse is inside collider
            if (collider != null && collider.shape != null && collider.shape.contains(child.x, child.y, child.rotation, worldMouse.x, worldMouse.y)) {
                this._hoveredObject = child;
            }

        })

        // Change cursor 
        if (this._hoveredObject !== null && this._hoveredObject.onClick !== undefined && this._hoveredObject.onClick !== null) {
            this.cursor = "pointer";
        }

        this._world.step(1 / 60);

        // iterate over bodies and fixtures
        for (var body = this._world.getBodyList(); body; body = body.getNext()) {
            for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
            // draw or update fixture
            }
        }

        var canvas = this._canvas;
        var ctx = canvas.getContext("2d")

        // Background
        ctx.fillStyle= "black";
        ctx.fillRect(this._offsetX, this._offsetY, this._screenWidth, this._screenHeight);

        super.preprocess(this);

        super.process(this);

        super.postprocess(this);
    
        // Draw Game
        this.draw(ctx);

        // Loop this function
        this._lastRender = timestamp
        window.requestAnimationFrame(this.process.bind(this))


    }

    draw(ctx) {


        super.predraw(this, ctx);

        super.draw(this, ctx);

        super.postdraw(this, ctx);

    }

    resize() {
        var canvas = this._canvas;
        var width = this._screenWidth;
        var height = this._screenHeight;

        canvas.style.width = "100%";
        canvas.style.height = "100%";
        var trueWidth = canvas.clientWidth;
        var trueHeight = canvas.clientHeight;
        var trueRatio = trueWidth / trueHeight;

        var widthLarger = false;
        if (trueRatio > this._screenSizeRatio) {
            widthLarger = true;
        }

        var newWidth = widthLarger ? (height * trueRatio) : width;
        var newHeight = !widthLarger ? (width / trueRatio) : height;

        canvas.width = newWidth;
        canvas.height = newHeight;

        this._offsetX = widthLarger ? (newWidth - width) / 2 : 0;
        this._offsetY = !widthLarger ? (newHeight - height) / 2 : 0;

        var drawPos =  this.screenCoordToWorld({x: this._offsetX, y: this._offsetY});

        this._drawX = drawPos.x;
        this._drawY = drawPos.y;

        this._canvasWidthRatio = trueWidth / newWidth;
        this._canvasHeightRatio = trueHeight / newHeight;
    }

}