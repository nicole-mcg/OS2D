
import { Component } from "./Component.js"
import { GameObject } from '../object/GameObject.js'

export class Generator extends Component {

    constructor(params) {
        super(Generator.componentName, "generator", params);
        this.lastGenerate = null;
        this.numGenerated = 0;
        this.timeSaved = 0;
    }

    onProcess(game) {
        if (!this.lastGenerate) {
            this.lastGenerate = game.time;
            return;
        }

        var timePassed = game.time - this.lastGenerate + this.timeSaved;

        while (timePassed > this.delay && (this.limit === 0 || this.numGenerated < this.limit)) {
            var obj = new GameObject(this.generateParams);

            obj.pos = this._gameObject.pos;

            if (this.onGenerate) {
                this.onGenerate(obj, game);
            }

            if (this.addToGame) {
                game.addGameObject(obj);
            }

            this.numGenerated++;
            this.lastGenerate = game.time;

            if (this.numGenerated === this.limit) {

                if (this.onComplete) {
                    this.onComplete(game);
                }

                if (this.destroyOnComplete) {
                    this._gameObject.removeComponent("generator");
                }
            }

            timePassed -= this.delay;
        }

        this.timeSaved += timePassed;

    }

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return super.toJSON(smartSerialize, isRoot, variables, blockWarning, ['lastGenerate', 'numGenerated', 'timeSaved'])
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new Generator({
            limit: obj.limit,
            delay: obj.delay,
            destroyOnComplete: obj.destroyOnComplete,
        })
    }

    static initialize() {
        Generator.componentName = "generator";
        Generator.validParams = {
            "limit": 'number',
            "delay": 'number',
            "addToGame": 'boolean',
            "destroyOnComplete": 'boolean',
            "generateParams": Object,
            "onGenerate": Function,
            "onComplete": Function
        };
        Generator.defaultParams = {
            "limit": 0,
            "delay": 1000,
            "addToGame": true,
            "destroyOnComplete": false,
            "generateParams": {},
        };
        Component.addComponent(Generator);
    }

}