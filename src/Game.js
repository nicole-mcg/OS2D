import GameObjectContainer from "./object/GameObjectContainer.js"
import GameObject from "./object/GameObject.js"
import Point from "./geom/Point.js"
import planck from "planck-js"

import { deepSerialize, setProperties } from "./tools/Serialize.js"

export default class Game extends GameObjectContainer {

    constructor(canvas, screenSize, pixeltoUnitRatio) {
        super();
        this._canvas = canvas;

        this._screenSize = new Point(screenSize.x, screenSize.y);
        this._scaleRatio = pixeltoUnitRatio;
        this._screenSizeRatio = screenSize.x / screenSize.y;

        this._lastRender = 0;
        this._timeDelta = 0;
        this._time =  new Date().getTime();

        // Game screen offset in pixels
        this._screenOffset = new Point(0, 0);

        // Camera offset
        this._cameraPos = new Point(0, 0);
        this._cameraZoom = 1;

        // Ratios for converting canvas pixels to screen pixels
        this._canvasWidthRatio = 0;
        this._canvasHeightRatio = 0;

        this.resize();
        window.onresize = this.resize.bind(this);

        this._mousePos = new Point(0, 0);

        canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

        this._world = planck.World(planck.Vec2(0.0, -9.8));

        this._world.on('remove-fixture', function(fixture) {
            console.log(fixture);
        });

        this._state = {};

        this._dragging = false;
        this._hoveredObject = null;
        this._clickedObject = null;

        this.shutdown = false;

        if (Game.classes) {
            Object.keys(Game.classes).forEach((key) => {
                this[key] = Game.classes[key];
            })
        }

        // Listen for all events fired
        for(var key in canvas){
            if(key.search('on') === 0) {
                canvas.addEventListener(key.slice(2), function(e) {
                    //console.log(e)
                })
            }
        }
        
    }

    get state() {
        return this._state;
    }

    // To behave like a GameObject, for changing GameObject parents
    get game() {
        return this;
    }

    get world() {
        return this._world;
    }

    get time() {
        return this._time;
    }

    get timeDelta() {
        return this._timeDelta;
    }

    get scaleRatio() {
        return this._scaleRatio;
    }

    get screenSize() {
        return this._screenSize;
    }

    get mousePos() {
        return this._mousePos;
    }

    get drawPos() {
        return this._cameraPos;
    }

    set cursor(cursor) {
        this._canvas.style.cursor = cursor;
    }

    worldCoordToScreen(p) {
        return new Point(p.x / this._scaleRatio, p.y / this._scaleRatio);
    }

    screenCoordToWorld(p) {
        return new Point(p.x * this._scaleRatio, p.y * this._scaleRatio);
    }

    canvasToScreenPoint(p) {
        return new Point((p.x / this._canvasWidthRatio) - this._screenOffset.x, (p.y / this._canvasHeightRatio) - this._screenOffset.y);
    }

    get hoveredObject() {
        return this._hoveredObject;
    }


    handleMouseMove(e) {

        this._mousePos = this.canvasToScreenPoint(new Point(e.offsetX, this._canvas.clientHeight - e.offsetY));

        if (this._clickedObject !== null) {

            if (!this._dragging) {
                this._clickedObject.onDragStart && this._clickedObject.onDragStart(this._clickedObject, this);
                this._dragging = true;
                return;
            }

            this._clickedObject.onDrag && this._clickedObject.onDrag(this._clickedObject, this);
        }

    }

    handleMouseDown(e) {
        if (this._hoveredObject !== null) {
            this._clickedObject = this._hoveredObject;

            var physicsBody = this._clickedObject.getComponent("physicsbody");
            if (physicsBody !== null) {
                physicsBody.forcePos = true;
            }

            this._hoveredObject.onMouseDown && this._hoveredObject.onMouseDown(this._hoveredObject, this);
        }

    }

    handleMouseUp(e) {

        if (this._clickedObject !== null ) {

            var physicsBody = this._clickedObject.getComponent("physicsbody");
            if (physicsBody !== null) {
                physicsBody.forcePos = false;
            }

            if (this._dragging) {
                if (this._clickedObject != null) {
                    this._clickedObject.onDragEnd && this._clickedObject.onDragEnd(this._clickedObject, this);
                    this._dragging = false;
                }
            } else if (this._clickedObject === this._hoveredObject) {
                this._clickedObject.onClick && this._clickedObject.onClick(this._clickedObject, this);
            }
        }

        this._clickedObject = null;

        if (this._hoveredObject !== null) {
            this._hoveredObject.onMouseUp && this._hoveredObject.onMouseUp(this._hoveredObject, this);
        }

    }

    process(timestamp) {

        this._time = new Date().getTime();
        
        // Get time between frames
        this._timeDelta = timestamp - this._lastRender

        if (!this._timeDelta) {
            this._lastRender = 0;
            this.requestFrame();
            return;
        }

        if (this._lastRender == 0) {
            this._lastRender = timestamp;
            this.requestFrame();
            return;
        }

        this.cursor = "default";


        var hoveredObject = null;
        this._children.forEach((child) => {
            if (hoveredObject !== null) return;

            var collider = child.getComponent("collider");
            var worldMouse = this.screenCoordToWorld(this.mousePos);

            // Mouse is inside collider
            if (collider != null && collider.shape != null && collider.shape.contains(child.pos, child.rotation, worldMouse)) {
                if (child.onMouseOver && child !== this._hoveredObject) {
                    //child.onMouseOver(this);
                }
                hoveredObject = child;
            } else if (child === this._hoveredObject) {
                child.onMouseOut && child.onMouseOut(this);
            }

        })

        this._hoveredObject = hoveredObject;

        // Change cursor
        if (this._hoveredObject && (
            this._hoveredObject.onClick || this._hoveredObject.onMouseDown ||
            this._hoveredObject.onDragStart || this._hoveredObject.onDrag || this._hoveredObject.onDragEnd)) {
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
        ctx.fillRect(this._screenOffset.x, this._screenOffset.y, this.screenSize.x, this.screenSize.y);

        super.preprocess(this);

        super.process(this);

        super.postprocess(this);
    
        // Draw Game
        this.draw(ctx);

        // Loop this function
        this._lastRender = timestamp
        
        this.requestFrame();
    }

    requestFrame() {
        if (this.shutdown) {
            return;
        }
        
        window.requestAnimationFrame(this.process.bind(this))
    }

    draw(ctx) {

        super.predraw(this, ctx);

        super.draw(this, ctx);

        super.postdraw(this, ctx);

    }

    resize() {
        var canvas = this._canvas;
        var width = this._screenSize.x;
        var height = this._screenSize.y;

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

        this._screenOffset = new Point(
            widthLarger ? (newWidth - width) / 2 : 0,
            !widthLarger ? (newHeight - height) / 2 : 0
        );

        var cameraSize = this.screenCoordToWorld(this.screenSize);
        cameraSize = cameraSize.setY(-cameraSize.y);

        this._cameraPos = this.screenCoordToWorld(this._screenOffset)
            //.add(cameraSize.scale(0.5));

        this._canvasWidthRatio = trueWidth / newWidth;
        this._canvasHeightRatio = trueHeight / newHeight;
    }

    toJSON(smartSerialize = false, isRoot = true, variables = {}, blockWarning=false) {
        return deepSerialize(this, [
            "_hoveredObject", "_clickedObject", "_dragging", "_lastRender", "_timeDelta", "_time", "_mousePos", "_canvasWidthRatio", "_canvasHeightRatio", "_screenOffset", "_state"
        ].concat(Object.keys(Game.classes)), smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(canvas, json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var game = new Game(canvas, obj.screenSize, obj.pixeltoUnitRatio);

        setProperties(game, obj, ["children"]);

        if (obj.children) {
            for (var i = 0; i < obj.children.length; i++) {
                game.addGameObject(GameObject.fromJSON(obj.children[i]));
            }
        }

        game.resize();

        return game;
    }

}