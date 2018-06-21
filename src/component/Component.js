

export class Component {

    constructor(name="", type="") {
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

        console.log("...")
        this._enabled = enabled;
    }

    addedToGameObject(game, gameObject) {
        this._game = game;
        this._gameObject = gameObject;
        if (this.onAdd !== undefined && this.onAdd !== null) {
            this.onAdd.bind(this)(game, gameObject);
        }
    }

    removedFromGameObject() {
        if (this.onRemove !== undefined && this.onRemove !== null) {
            this.onRemove.bind(this)();
        }
    }

    preprocess(game) {
        if (this._enabled && this.onPreprocess !== undefined && this.onPreprocess !== null) {
            this.onPreprocess.bind(this)(game);
        }
    }

    process(game) {
        if (this._enabled && this.onProcess !== undefined && this.onProcess !== null) {
            this.onProcess.bind(this)(game);
        }
    }

    postprocess(game) {
        if (this._enabled && this.onPostprocess !== undefined && this.onPostprocess !== null) {
            this.onPostprocess.bind(this)(game);
        }
    }

    predraw(game, ctx) {
        if (this._enabled && this.onPredraw !== undefined && this.onPredraw !== null) {
            this.onPredraw.bind(this)(game, ctx);
        }
    }

    draw(game, ctx) {
        if (this._enabled && this.onDraw !== undefined && this.onDraw !== null) {
            this.onDraw.bind(this)(game, ctx);
        }
    }

    postdraw(game, ctx) {
        if (this._enabled && this.onPostdraw !== undefined && this.onPostdraw !== null) {
            this.onPostdraw.bind(this)(game, ctx);
        }
    }

    static initialize() {
        Component.components = {};
    }

    static addComponent(componentClass) {
        Component.components[componentClass.name] = componentClass;
    }

    static createComponent(componentName, params) {
        componentName = componentName.toLowerCase();

        if (params === undefined || params === null) {
            params = {};
        }

        var componentClass = Component.components[componentName];
        if (componentClass !== undefined && componentClass !== null) {
            return new componentClass(params);
        }

        console.log("Could not find component: " + componentName)
    }

}