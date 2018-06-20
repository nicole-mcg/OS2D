
import { Component } from "./Component.js"
import { Shape } from "../geom/shape/Shape.js"

export class ShapeRenderer extends Component {

    constructor(params) {
        super(ShapeRenderer.name, "renderer");
        
        this.shape = null;
        if (Object.keys(params).includes("shape")) {

            if (!params.shape instanceof Shape) {
                console.err("'shape' params must be a Shape object");
            }

            this.shape = params.shape;
        }

        this.color = null;
        if (Object.keys(params).includes("color")) {
            this.color = params.color;
        }

       // super.onDraw = this._onDraw;
    }

    onDraw(game, ctx) {

        if (this.color != null) {
            ctx.fillStyle = this.color;
        }

        if (this.shape != null) {
            this.shape.draw(ctx, this.gameObject.drawX, this.gameObject.drawY, this.gameObject.rotation, game.scaleRatio);
        }

    }

    static get name() {
        return "shaperenderer";
    }

    static initialize() {
        Component.addComponent(ShapeRenderer);
    }

}