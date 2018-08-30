
import Component from "./Component"
import Game from '../Game'
import GameObject from '../object/GameObject'

export default class Generator extends Component {

    lastGenerate : number = null;
    numGenerated : number = 0;
    timeSaved : number = 0;

    limit : number = 0;
    delay : number = 1000;

    addToGame : boolean = true;

    destroyOnComplete : boolean;

    generateParams : any;

    onGenerate(object : GameObject, game : Game, generator : Generator) {}
    onComplete(game : Game) {}

    constructor(params) {
        super('generator', "generator", params);
    }

    onProcess(game : Game) {
        var obj : GameObject = this.gameObject;

        if (!this.lastGenerate) {
            this.lastGenerate = game.time;
            return;
        }

        var timePassed = game.time - this.lastGenerate + this.timeSaved;

        while (timePassed > this.delay && (this.limit === 0 || this.numGenerated < this.limit)) {
            var newObj = GameObject.create(this.generateParams);

            newObj.pos = this._gameObject.pos;

            this.onGenerate(newObj, game, this);

            if (this.addToGame) {
                game.addGameObject(newObj);
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

}

Component.registerComponent('generator', Generator);