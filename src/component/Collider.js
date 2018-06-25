
import { Component } from "./Component.js"
import { Shape } from "../geom/shape/Shape.js"
import planck from "planck-js"

export class Collider extends Component {

    constructor(params) {
        super(Collider.componentName, "collider", params);

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