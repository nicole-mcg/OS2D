import GameObjectContainer from "./GameObjectContainer.js"
import Component from "../component/Component.js"

import Point from "../geom/Point.js"

import { deepSerialize, setProperties, loadFunctions } from "../tools/Serialize.js"

export default class GameObject extends GameObjectContainer {

    constructor(params) {
        super();

        // private variables

        this._game = null;
        this._parent = null;

        this._pos = new Point(0, 0);
        this._rotation = 0;

        this._width = 0;
        this._height = 0;

        this._speed = new Point(0, 0);

        this._components = {};

        this._state = {};

        this._fixedPosition = false;

        // public variables
        if (params) {
            setProperties(this, params);
        }
        
    }

    get state() {
        return this._state;
    }

    get game() {
        return this._game;
    }

    get parent() {
        return this._parent;
    }

    get pos() {
        return this._pos;
    }

    get x() {
        return this._pos.x;
    }

    get y() {
        return this._pos.y;
    }

    get drawPos() {
        if (this.game == null) {
            return new Point(0, 0);
        }

        if (fixedPosition) {
            var pos = this.pos;
            if (this.parent && this.parent.fixedPosition) {
                pos = pos.add(this.parent.drawPos);
            }
            return pos;
        }

        var pos = this.pos.setY(this.game.screenCoordToWorld(this.game.screenSize).y - this.y);//Invert Y

        if(this.parent) {
            return pos.add(this.parent.drawPos);
        }

        return pos;
    }

    get fixedPosition() {

    }

    get rotation() {
        return this._rotation;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get speed() {
        return this._speed;
    }

    get xSpeed() {
        return this.speed.x;
    }

    get ySpeed() {
        return this.speed.y;
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
        }
        
    }

    set fixedPosition(fixedPosition) {
        this._fixedPosition = fixedPosition;
    }

    set pos(p) {
        this._pos = p;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody && physicsBody.body) {
            var pos = physicsBody.body.getPosition();
            pos.x = p.x;
            pos.y = p.y;
            physicsBody.body.setPosition(pos);
        }
    }

    set x(x) {
        this.pos = this.pos.setX(x);
    }

    set y(y) {
        this.pos = this.pos.setY(y);
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
        if (physicsBody && physicsBody.body) {
            physicsBody.body.setAngle(rotation);
        }
    }

    set speed(speed) {
        this._speed = speed;

        var physicsBody = this.getComponent("physicsbody");
        if (physicsBody && physicsBody.body) {
            var vel = physicsBody.body.getLinearVelocity();
            vel.x = speed.x;
            vel.y = speed.y
            physicsBody.body.setLinearVelocity(vel);
        }        
    }

    set xSpeed(xSpeed) {
        this.speed = this.speed.setX(xSpeed);
    }

    set ySpeed(ySpeed) {
        this.speed = this.speed.setY(ySpeed);
    }

    removeComponent(component) {

        if (component instanceof Component) {
            var index = Object.values(this._components).indexOf(component);
            if (index != -1) {
                this._components[Object.keys(this._components)[index]] = component;
            }
            return true;
        }

        if ((typeof component) === 'string') {
            delete this._components[component];
            return true;
        }

        return false;
    }

    addComponent(component, params={}) {

        var comp = null
        if (component instanceof Component) {
            if (this._components[component.type] != null) {
                console.err("Replacing existing component! " + component.type);
                return;
            }
            
            comp = component;
        }

        if ((typeof component) === 'string') {

            comp = Component.createComponent(component, params);
            if (!comp) {
                console.log("error creating commponent: " + component)
                return;
            }

        }

        if (comp) {
            this._components[comp.type] = comp;
            if (this._game != null) {
                comp.addedToGameObject(game, this);
            }
        }

        return comp;  
    }

    getComponent(componentName) {
        var comp = this._components[componentName];
        return comp === undefined ? null : comp;
    }

    hasComponent(componentName) {
        var comp = this._components[componentName];
        return comp !== undefined && comp !== null;
    }

    rotate(angleToAdd) {
        this._rotation += angleToAdd;
    }

    preprocess(game) {

        // Preprocess
        if (this.onPreprocess !== undefined && this.onPreprocess != null) {
            this.onPreprocess(this, game);
        }

        // Children preprocess
        super.preprocess(game);

        // Components preprocess
        Object.values(this._components).forEach((component) => {
            component.preprocess(this, game);
        });

    }

    process(game) {

        var timeDelta = game.timeDelta;

        if (this.onProcess !== undefined && this.onProcess != null) {
            this.onProcess(this, game);
        }

        if (!this.getComponent('physicsbody')) {
            this._x += this.xSpeed * timeDelta;
            this._y += this.ySpeed * timeDelta;
        }

        // Process children
        super.process(game);

        // Components preprocess
        Object.values(this._components).forEach((component) => {
            component.process(this, game);
        });

    }

    postprocess(game) {

        // Postprocess
        if (this.onPostprocess !== undefined && this.onPostprocess != null) {
            this.onPostprocess(this, game);
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
            this.onPredraw(this, game, ctx);
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
            this.onDraw(this, game, ctx);
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
            this.onPostdraw(this, game, ctx);
        }

        // Children postdraw
        super.postdraw(game, ctx);

        // Components postdraw
        Object.values(this._components).forEach((component) => {
            component.postdraw(game, ctx);
        });
    }

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        var obj = Object.assign({}, this);
        obj._components = {};
        Object.keys(this._components).forEach((key) => {
            obj._components[this._components[key].name] = this._components[key];
        })
        //console.log(obj);
        return deepSerialize(obj, ["_parent", "_game", "_state"], smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(json) {
        var obj = (typeof json) === 'string' ? JSON.parse(json) : json;

        loadFunctions(json);

        var gameObj = new GameObject();

        if (obj) {
            setProperties(gameObj, obj, ["children", "components"]);

            if (obj.children) {
                for (var i = 0; i < obj.children.length; i++) {
                    gameObj.addGameObject(GameObject.fromJSON(obj.children[i]));
                }
            }

            if (obj.components) {
                Object.keys(obj.components).forEach((key) => {
                    var comp = obj.components[key]
                    gameObj.addComponent(key, obj.components[key]);
                });
            }
        }

        return gameObj;
    }

    static create(params) {
        return GameObject.fromJSON(params);
    }

    static initialize() {
        GameObject.eventFuncs = [
            'onClick', 'onMouseDown', 'onMouseUp', 'onHover',
            'onDragStart', 'onDrag', 'onDragEnd',
            'onPreprocess', 'onProcess', 'onPostprocess',
            'onPredraw', 'onDraw', 'onPostdraw'
        ]

    }

}