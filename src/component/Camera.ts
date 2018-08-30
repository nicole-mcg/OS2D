import Component from "./Component"
import Shape from "../geom/shape/Shape"
import Point from "../geom/Point"

export default class Camera extends Component {
    zoom : number = 1;
    index : number = -1;

    constructor(params) {
        super('camera', "camera", params);
    }

    onAdd(game, gameObject) {
        this.index = game.addCamera(this.gameObject);
    }

    onPredraw(game, ctx) {
        game._cameraRenderIndex = this.index;

        game.predraw(game, ctx);
    }

    onDraw(game, ctx) {
        game.draw(game, ctx);
    }

    onPostdraw(game, ctx) {
        game.postdraw(game, ctx);   
    }

}

Component.registerComponent('camera', Camera);