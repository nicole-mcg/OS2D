import GameObjectContainer from "./object/GameObjectContainer"
import GameObject from "./object/GameObject"
import PhysicsBody from "./component/PhysicsBody"
import Collider from "./component/Collider"
import Point from "./geom/Point"
import planck from "planck-js"

import Camera from './component/Camera'

import { deepSerialize, setProperties } from "./tools/Serialize"

export default class Game extends GameObjectContainer {

    static classes : any;

    _canvas : HTMLCanvasElement;

    _screenSize : Point;
    _scaleRatio : number;
    _screenSizeRatio : number;
    _screenOffset : Point;

    _lastRender : number;
    _timeDelta : number;
    _time : number;

    _cameraPos : Point;
    _cameraZoom : number;

    //TODO should be point
    _canvasWidthRatio : number;
    _canvasHeightRatio : number;

    _mousePos : Point;

    _world : any;

    _state : any;

    _dragging : boolean;
    _hoveredObject : GameObject;
    _clickedObject : GameObject;

    _cameras : Camera[];
    _cameraRenderIndex : number;

    shutdown : boolean;

    constructor(canvas, screenSize, pixeltoUnitRatio) {
        super();
        this._canvas = canvas;

        this._screenSize = new Point(screenSize.x, screenSize.y);
        this._scaleRatio = pixeltoUnitRatio;
        this._screenSizeRatio = screenSize.x / screenSize.y;

        // Game screen offset in pixels
        this._screenOffset = new Point(0, 0);

        this._lastRender = 0;
        this._timeDelta = 0;
        this._time =  new Date().getTime();

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

        this._cameras = [];
        this._cameraRenderIndex = 0; // The index of the camera that is currently rendering

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

    get cameras() {
        return this._cameras.slice(0); // Pass a new array that contains the cameras (to preserve immutablility)
    }

    addCamera(cameraObj : GameObject) {
        var camera = camera.getComponent('camera');

        if (!camera) {
            //TODO throw error
            return;
        }

        this._cameras.push(camera);
        return this._cameras.length - 1;
    }

    handleMouseMove(e) {

        this._mousePos = this.canvasToScreenPoint(new Point(e.offsetX, this._canvas.clientHeight - e.offsetY));

        if (this._clickedObject !== null) {

            if (!this._dragging) {
                this._clickedObject.onDragStart && this._clickedObject.onDragStart(this);
                this._dragging = true;
                return;
            }

            this._clickedObject.onDrag && this._clickedObject.onDrag(this);
        }

    }

    handleMouseDown(e) {
        if (this._hoveredObject !== null) {
            this._clickedObject = this._hoveredObject;

            var physicsBody : PhysicsBody = this._clickedObject.getComponent("physicsbody") as PhysicsBody;
            if (physicsBody !== null) {
                physicsBody.forcePos = true;
            }

            this._hoveredObject.onMouseDown && this._hoveredObject.onMouseDown(this);
        }

    }

    handleMouseUp(e) {

        if (this._clickedObject !== null ) {

            var physicsBody : PhysicsBody = this._clickedObject.getComponent("physicsbody") as PhysicsBody;
            if (physicsBody !== null) {
                physicsBody.forcePos = false;
            }

            if (this._dragging) {
                if (this._clickedObject != null) {
                    this._clickedObject.onDragEnd && this._clickedObject.onDragEnd(this);
                    this._dragging = false;
                }
            } else if (this._clickedObject === this._hoveredObject) {
                this._clickedObject.onClick && this._clickedObject.onClick(this);
            }
        }

        this._clickedObject = null;

        if (this._hoveredObject !== null) {
            this._hoveredObject.onMouseUp && this._hoveredObject.onMouseUp(this);
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
        this._children.forEach((child : GameObject) => {
            if (hoveredObject !== null) return;

            var collider : Collider = child.getComponent("collider") as Collider;
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

        this._cameras.forEach((camera) => {
            camera.predraw(this, ctx);

            camera.draw(this, ctx);

            camera.postdraw(this, ctx);
        })

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
            .add(cameraSize.scale(0.5));

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