
import Component from "./Component"
import Shape from "../geom/shape/Shape"
import planck from "planck-js"

export default class Collider extends Component {

    shape : Shape;

    constructor(params) {
        super('collider', "collider", params);
    }

    onAdd(game, gameObject) {
        var physicsBody = gameObject.getComponent("physicsbody");

        if (physicsBody && !physicsBody.collider) {
            if (!physicsBody.onAdd(game, gameObject)) {
                gameObject.removeComponent('physicsbody');
            }
        }

        return true;
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new Collider({shape: Shape.fromJSON(obj.shape)});
    }

}
Component.registerComponent('collider', Collider);