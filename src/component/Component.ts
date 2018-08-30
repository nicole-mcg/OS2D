
import Game from '../Game'
import GameObject from '../object/GameObject'

import { deepSerialize, setProperties, loadFunctions } from "../tools/Serialize"

export default class Component {

    static components : any = {};

    _name : string;
    _type : string;

    _game : Game;
    _gameObject : GameObject;

    _enabled : boolean;

    onAdd(obj : GameObject, game : Game) {}

    onPreprocess(game : Game) {}
    onProcess(game : Game) {}
    onPostprocess(game : Game) {}

    onPredraw(game : Game, ctx : CanvasRenderingContext2D) {}
    onDraw(game : Game, ctx : CanvasRenderingContext2D) {}
    onPostdraw(game : Game, ctx : CanvasRenderingContext2D) {}

    onRemove() {}

    constructor(name="", type="", params) {
        this._name = name.toLowerCase();
        this._type = type.toLowerCase();

        setProperties(this, params);

        this._game = null;
        this._gameObject = null;

        this._enabled = true;
    }

    get name() {
        return this._name;
    }

    get type() {
        return this._type;
    }

    get game() {
        return this._game;
    }

    get gameObject() {
        return this._gameObject;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(enabled) {
        this._enabled = enabled;
    }

    isType(type) {
        return this.type === type;
    }

    addedToGameObject(game, gameObject) {
        this._game = game;
        this._gameObject = gameObject;
        if (this.onAdd !== undefined && this.onAdd !== null) {
            return this.onAdd(game, gameObject);
        }

        return true;
    }

    removedFromGameObject() {
        this.onRemove();
    }

    preprocess(game) {
        if (this._enabled) {
            this.onPreprocess(game);
        }
    }

    process(game) {
        if (this._enabled) {
            this.onProcess(game);
        }
    }

    postprocess(game) {
        if (this._enabled) {
            this.onPostprocess(game);
        }
    }

    predraw(game, ctx) {
        if (this._enabled) {
            this.onPredraw(game, ctx);
        }
    }

    draw(game, ctx) {
        if (this._enabled) {
            this.onDraw(game, ctx);
        }
    }

    postdraw(game, ctx) {
        if (this._enabled) {
            this.onPostdraw(game, ctx);
        }
    }

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false, extraIgnores=[]) {
        return deepSerialize(this, ["_game", "_gameObject"].concat(extraIgnores), smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var componentClass = Component.components[obj.name];

        if (componentClass) {
            return componentClass.fromJSON(json);
        }
        
    }

    static addComponent(componentClass) {
        Component.components[componentClass.componentName] = componentClass;
    }

    static validateParam(paramName, params, validParams) {

        var param = params[paramName]

        if (param === undefined || param === null) {
            return false;
        }

        if (!Object.keys(validParams).includes(paramName)) {
            throw "Error: invalid param (doesn't exist): name=" + paramName;
            return false;
        }

        var valid = false;
        if (validParams[paramName] instanceof Array) {
            valid = validParams[paramName].includes(param);
        } else {
            if (validParams[paramName] === null) {
                valid = true;
            } else if (typeof validParams[paramName] === 'string') {
                valid = typeof param === validParams[paramName];
            } else {
                valid = param instanceof validParams[paramName];

                if (validParams[paramName].fromJSON && (typeof param === 'object' || typeof param === 'string')) {
                    params[paramName] = validParams[paramName].fromJSON(param);
                    return true;
                }
            }

            if (!valid) {
                valid = typeof param.toString().toLowerCase() === validParams[paramName].name.toLowerCase();
            }
        }   

        return valid;
                   
    }

    static createComponent(componentName : string, params : any = {}, forceCreation : boolean = true) {
        componentName = componentName.toLowerCase();

        loadFunctions(params);

        var componentClass = Component.components[componentName];

        if (!componentClass) {
            console.log("Could not find component: " + componentName)
            return;
        }

        return new componentClass(params);  
    }

    static registerComponent(componentName, componentClass) {
        Component.components[componentName] = componentClass;
    }

}