
import { Component } from "./Component.js"
import { Shape } from "../geom/shape/Shape.js"
import planck from "planck-js"

export class Collider extends Component {

    constructor(params) {
        super(Collider.name, "collider");

        this.shape = null;
        if (Object.keys(params).includes("shape")) {

            if (!params.shape instanceof Shape) {
                console.err("'shape' params must be a Shape object");
            }

            this.shape = params.shape;
        }

    }

    onProcess(game) {

    }

    static get name() {
        return "collider";
    }

    static initialize() {
        Component.addComponent(Collider);
    }

}