import { Game } from "../Game.js"
import { GameObjectContainer } from "./GameObjectContainer.js"

export class GameObject extends GameObjectContainer {

    constructor() {
        super();

        // private variables

        this._game = null;
        this._parent = null;

        this._x = 0;
        this._y = 0;
        this._rotation = 0;

        this._width = 0;
        this._height = 0;

        this._xSpeed = 0;
        this._ySpeed = 0;

        this._components = {};

        // public variables

        /*
        this.onClick = undefined;

        this.onMouseDown = undefined;
        this.onMouseUp = undefined;
        this.onHover = undefined;

        this.onDrag = undefined;

        this.onPreprocess = undefined;
        this.onProcess = undefined;
        this.onPostprocess = undefined;

        this.onPredraw = undefined;
        this.onDraw = undefined;
        this.onPostdraw = undefined;
        */
    }

    get game() {
        return this._game;
    }

    get parent() {
        return this._parent;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get drawX() {

        if (this.game == null) {
            return 0;
        }

        var x = this.x;

        if (this.parent != null) {
            x += this.parent.drawX;
        }

        return x;
    }

    get drawY() {

        if (this.game == null) {
            return 0;
        }

        var y = this.game.screenCoordToWorld({x: this.game.screenWidth, y: this.game.screenHeight}).y - this.y;

        if (this.parent != null) {
            var temp = this.parent.drawY;
            y += temp;
        }

        return y;
    }

    get rotation() {

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            return physicsBody.body.getAngle();
        }

        return this._rotation;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get xSpeed() {

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            return physicsBody.body.getLinearVelocity().x;
        }

        return this._xSpeed;
    }

    get ySpeed() {

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            return physicsBody.body.getLinearVelocity().y;
        }

        return this._ySpeed;
    }

    set game(game) {
        this._game = game;
        this._children.forEach((child) => {
            child.game = game;
        })
        Object.values(this._components).forEach((component) => {
            component.addedToGameObject(game, this);
        })
    }

    set parent(parent) {
        this._parent = parent;

        if (!parent.hasGameObject(this)) {
            parent.addGameObject(this);
        }

        if (parent.game != null) {
            this.game = parent.game;
        } else if (parent instanceof Game) {
            this.game = parent;
        }
    }

    set x(x) {
        this._x = x;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            var pos = physicsBody.body.getPosition();
            pos.x = x;
            physicsBody.body.setPosition(pos);
        }
    }

    set y(y) {
        this._y = y;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            var pos = physicsBody.body.getPosition();
            pos.y = y;
            physicsBody.body.setPosition(pos);
        }
    }

    set width(width) {
        this._width = width;
    }

    set height(height) {
        this._height = height;
    }

    set rotation(rotation) {
        this._rotation = rotation;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            physicsBody.body.setAngle(rotation);
        }
    }

    set xSpeed(xSpeed) {
        this._xSpeed = xSpeed;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            var vel = physicsBody.body.getLinearVelocity();
            vel.x = xSpeed;
            physicsBody.body.setLinearVelocity(vel);
        }
    }

    set ySpeed(ySpeed) {
        this._ySpeed = ySpeed;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody != null) {
            var vel = physicsBody.body.getLinearVelocity();
            vel.y = ySpeed;
            physicsBody.body.setLinearVelocity(vel);
        }
    }

    addComponent(component) {

        if (this._components[component.type] != null) {
            console.err("Replacing existing component! " + component.type)
        }

        this._components[component.type] = component;
        
        if (this._game != null) {
            component.addedToGameObject(game, this);
        }

        return component;
    }

    getComponent(componentName) {
        var comp = this._components[componentName];
        return comp === undefined ? null : comp;
    }

    hasComponent(componentName) {
        var comp = this._components[componentName];
        return comp !== undefined && comp !== null;
    }

    setPos(x, y) {
        this._x = x;
        this._y = y;
    }

    rotate(angleToAdd) {
        this._rotation += angleToAdd;
    }

    preprocess(game) {

        // Preprocess
        if (this.onPreprocess !== undefined && this.onPreprocess != null) {
            this.onPreprocess(game);
        }

        // Children preprocess
        super.preprocess(game);

        // Components preprocess
        Object.values(this._components).forEach((component) => {
            component.preprocess(game);
        });

    }

    process(game) {

        var timeDelta = game.timeDelta;

        if (this.onProcess !== undefined && this.onProcess != null) {
            this.onProcess(game);
        }

        //this._x += this.xSpeed * timeDelta;
        //this._y += this.ySpeed * timeDelta;

        // Process children
        super.process(game);

        // Components preprocess
        Object.values(this._components).forEach((component) => {
            component.process(game);
        });

    }

    postprocess(game) {

        // Postprocess
        if (this.onPostprocess !== undefined && this.onPostprocess != null) {
            this.onPostprocess(game);
        }

        // Children postprocess
        super.postprocess(game);

        // Components postprocess
        Object.values(this._components).forEach((component) => {
            component.postprocess(game);
        });

    }

    predraw(game, ctx) {

        if (this.onPredraw !== undefined && this.onPredraw != null) {
            this.onPredraw.bind(this)(game, ctx);
        }

        // Children predraw
        super.predraw(game, ctx);

        // Components predraw
        Object.values(this._components).forEach((component) => {
            component.predraw(game, ctx);
        });

    }

    draw(game, ctx) {

        if (this.onDraw !== undefined && this.onDraw != null) {
            this.onDraw.bind(this)(game, ctx);
        }

        // Draw children
        super.draw(game, ctx);

        // Components draw
        Object.values(this._components).forEach((component) => {
            component.draw(game, ctx);
        });

    }

    postdraw(game, ctx) {
        if (this.onPostdraw !== undefined && this.onPostdraw != null) {
            this.onPostdraw.bind(this)(game, ctx);
        }

        // Children postdraw
        super.postdraw(game, ctx);

        // Components postdraw
        Object.values(this._components).forEach((component) => {
            component.postdraw(game, ctx);
        });
    }

}