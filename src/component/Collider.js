
import Component from "./Component.js"
import Shape from "../geom/shape/Shape.js"
import planck from "planck-js"

export default class Collider extends Component {

    constructor(params) {
        super(Collider.componentName, "collider", params);

    }

    onAdd(game, gameObject) {
        var physicsBody = gameObject.getComponent("physicsbody");

        if (physicsBody && !physicsBody.collider) {
            physicsBody.onAdd(game, gameObject);
        }
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new Collider({shape: Shape.fromJSON(obj.shape)});
    }

    static initialize() {
        Collider.componentName = "collider";
        Collider.validParams = {
            "shape": Shape
        };
        Component.addComponent(Collider);
    }

}