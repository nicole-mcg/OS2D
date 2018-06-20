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

        canvas.addEventListener("click", this.handleClick.bind(this));

        this._world = planck.World(planck.Vec2(0.0, 9.8));

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

    worldCoordToScreen(xOrY) {
        return xOrY / this._scaleRatio;
    }

    screenCoordToWorld(xOrY) {
        return xOrY * this._scaleRatio;
    }

    canvasToScreenPoint(p) {
        return {
            x: (p.x / this._canvasWidthRatio) - this._offsetX,
            y: (p.y / this._canvasHeightRatio) - this._offsetY
        }
    }

    handleClick(e) {

        var p = this.canvasToScreenPoint({
            x: e.clientX,
            y: e.clientY
        })

        this._children.forEach((child) => {

            var collider = child.getComponent("collider");

            // Mouse is inside collider
            if (collider != null && collider.shape != null && collider.shape.contains(child.x, child.y, child.rotation, this.screenCoordToWorld(this._mouseX), this.screenCoordToWorld(this._mouseY))) {

                if (child.onClick != null) {
                    child.onClick();
                }

            }

        })

    }

    handleMouseMove(e) {

        var p = this.canvasToScreenPoint({
            x: e.clientX,
            y: e.clientY
        })

        this._mouseX = p.x;
        this._mouseY = p.y;

        if (this._clickedObject !== null) {
            this._clickedObject.onDrag(this);
        }

    }

    handleMouseDown(e) {

        if (this._hoveredObject !== null) {
            this._clickedObject = this._hoveredObject;

            if (this._hoveredObject.onMouseDown !== undefined && this._hoveredObject.onMouseDown !== null) {
                this._hoveredObject.onMouseDown(this);
            }
        }

    }

    handleMouseUp(e) {

        this._clickedObject = null;

        if (this._hoveredObject !== null && this._hoveredObject.onMouseUp !== undefined && this._hoveredObject.onMouseUp !== null) {
            this._hoveredObject.onMouseUp(this);
        }

    }

    process(timestamp) {
        this.cursor = "default";
        
        // Get time between frames
        this._timeDelta = timestamp - this._lastRender

        if (!this._timeDelta instanceof Number) {
            this._lastRender = 0;
            return;
        }

        this._hoveredObject = null;
        this._children.forEach((child) => {

            var collider = child.getComponent("collider");

            // Mouse is inside collider
            if (collider != null && collider.shape != null && collider.shape.contains(child.x, child.y, child.rotation, this.screenCoordToWorld(this._mouseX), this.screenCoordToWorld(this._mouseY))) {
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
        var excess = 0;
        if (trueRatio > this._screenSizeRatio) {
            widthLarger = true;
        } else if (trueRatio < this._screenSizeRatio) {
        }

        var newWidth = widthLarger ? (height * trueRatio) : width;
        var newHeight = !widthLarger ? (width / trueRatio) : height;

        canvas.width = newWidth;
        canvas.height = newHeight;

       

        this._offsetX = widthLarger ? (newWidth - width) / 2 : 0;
        this._offsetY = !widthLarger ? (newHeight - height) / 2 : 0;

        this._drawX = this.screenCoordToWorld(this._offsetX);
        this._drawY = this.screenCoordToWorld(this._offsetY);

        this._canvasWidthRatio = trueWidth / newWidth;
        this._canvasHeightRatio = trueHeight / newHeight;
    }

}