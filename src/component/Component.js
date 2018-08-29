import { deepSerialize, setProperties, loadFunctions } from "../tools/Serialize.js"

export default class Component {

    constructor(name="", type="", params) {
        this._name = name.toLowerCase();
        this._type = type.toLowerCase();

        /*this.onAdd = undefined;
        this.onRemove = undefined;

        this.onPreprocess = undefined;
        this.onProcess = undefined;
        this.onPostprocess = undefined;

        this.onPredraw = undefined;
        this.onDraw = undefined;
        this.onPostdraw = undefined;*/

        setProperties(this, params);

        this._game = null;
        this._gameObject = null;

        this._enabled = true;

        //console.log(this.toJSON());
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
        if (this.onRemove !== undefined && this.onRemove !== null) {
            this.onRemove();
        }
    }

    preprocess(obj, game) {
        if (this._enabled) {
            this .onPreprocess && this.onPreprocess(obj, game);
        }
    }

    process(obj, game) {
        if (this._enabled) {
            this. onProcess && this.onProcess(obj, game);
        }
    }

    postprocess(obj, game) {
        if (this._enabled) {
            this. onPostprocess && this.onPostprocess(obj, game);
        }
    }

    predraw(obj, game, ctx) {
        if (this._enabled && !this.isType('camera')) {
            this. onPredraw && this.onPredraw(obj, game, ctx);
        }
    }

    draw(obj, game, ctx) {
        // Avoid drawing the camera component as part of the game object
        // This allows us to use `onDraw` for true camera functionality
        //      while still allowing us to process it normally as a GameObject
        if (this._enabled && !this.isType('camera')) {
            this.onDraw && this.onDraw(obj, game, ctx);
        }
    }

    postdraw(obj, game, ctx) {
        if (this._enabled && !this.isType('camera')) {
            this.onPostdraw && this.onPostdraw(obj, game, ctx);
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

    static initialize() {
        Component.eventFuncs = [
            'onAdd', 'onRemove',
            'onPreprocess', 'onProcess', 'onPostprocess',
            'onPredraw', 'onDraw', 'onPostdraw',
        ];
        Component.components = {};
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

    static createComponent(componentName, params, forceCreation=true) {
        componentName = componentName.toLowerCase();

        if (params === undefined || params === null) {
            params = {};
        }

        loadFunctions(params);

        var componentClass = Component.components[componentName];

        if (!componentClass) {
            console.log("Could not find component: " + componentName)
            return;
        }

        var validParams = componentClass.validParams;
        //console.log(componentName, validParams, params);

        Object.keys(Component.eventFuncs).forEach((key) => {
            validParams[Component.eventFuncs[key]] = Function;
        })

        var validParamKeys = Object.keys(validParams);
        var paramKeys = Object.keys(params);

        var acceptedParams = {};
        for (var i = 0; i < paramKeys.length; i++) {
            var key = paramKeys[i];
            var value = params[key];

            if (key === 'name' || key === 'type'){
                continue;
            }

            if (key !== 'enabled' && !forceCreation) {
                if (!Component.validateParam(key, params, validParams)) {
                    throw "Error: invalid param (incorrect name or type): name=" + key + " type=" + (typeof value) + (validParams[key] ? " should be type: " + validParams[key] : "");
                    continue;
                }
            }

            

            acceptedParams[key] = params[key];
        }

        //Fill any unfilled values with default values
        var defaultParams = componentClass.defaultParams;
        if (defaultParams) {
            var defaultParamKeys = Object.keys(defaultParams);
            for (var i = 0; i < defaultParamKeys.length; i++) {
                var paramName = defaultParamKeys[i];


                if (acceptedParams[paramName] !== undefined) {
                    continue;
                }

                if (!forceCreation && !Component.validateParam(paramName, defaultParams, validParams)) {
                    throw "Error: invalid default param (incorrect name or type): name=" + paramName + " type=" + (typeof defaultParams[paramName]) + (validParams[paramName] ? " should be type: " + validParams[paramName] : "");
                    continue;
                }


                acceptedParams[paramName] = defaultParams[paramName];

            }
        }

        return new componentClass(acceptedParams);
    

        
    }

}