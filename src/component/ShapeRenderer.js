
import Component from "./Component.js"
import Shape from "../geom/shape/Shape.js"

export default class ShapeRenderer extends Component {

    constructor(params) {
        super(ShapeRenderer.componentName, "renderer", params);
       // super.onDraw = this._onDraw;
    }

    onDraw(game, ctx) {

        if (this.color != null) {
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = 'red';
        }

        if (this.shape != null) {
            
            var pos = this.gameObject.drawPos;
            this.shape.draw(ctx, pos, this.gameObject.rotation, game.scaleRatio);
            ctx.fill();

            if (this.outlineWidth != 0) {
                ctx.strokeStyle = this.outlineColor;
                ctx.lineWidth = this.outlineWidth;
                ctx.stroke();
            }
        }

    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new ShapeRenderer({
            shape: Shape.fromJSON(obj.shape),
            color: obj.color,
            outlineColor: obj.outlineColor,
            outlineWidth: obj.outlineWidth
        });
    }

    static initialize() {
        ShapeRenderer.componentName = "shaperenderer"
        ShapeRenderer.validParams = {
            "shape": Shape,
            "color": null,
            "outlineColor": null,
            "outlineWidth": 'number'
        };
        ShapeRenderer.defaultParams = {
            "color": "blue",
            "outlineColor": "black",
            "outlineWidth": 0,
        }
        Component.addComponent(ShapeRenderer);
    }

}