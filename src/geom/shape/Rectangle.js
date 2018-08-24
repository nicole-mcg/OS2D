
import Shape from "./Shape.js"
import Point from "../Point.js"

import { deepSerialize } from "../../tools/Serialize.js" 

export default class Rectangle extends Shape {

    constructor(width, height) {
        super({
            width: width,
            height: height,
            vertices: (function() {

                var distance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
                var angle = Math.PI / 4;
                var vertices = [];
                for (var i = 0; i < 4; i++) {
                    vertices.push(new Point(
                        distance * Math.cos(-angle),
                        -distance * Math.sin(-angle)
                    ));
                    angle += Math.PI / 2
                }
                return vertices;
            })()
        }, 5);

        if (this.width === undefined || this.width === null ||
            this.height === undefined || this.height === null) {
            throw "Invalid Rectangle: width=" + this.width + " height=" + this.height;
        }

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get type() {
        return 'rectangle';
    }

    get width() {
        return this.get("width");
    }

    get height() {
        return this.get('height');
    }

    contains(pos, rotation, otherPos) {
        var rotatedPoint = otherPos.rotate(pos, rotation);

        return rotatedPoint.x >= pos.x - this.width / 2 && rotatedPoint.y >= pos.y - this.height / 2 &&
            rotatedPoint.x <= pos.x + this.width / 2 && rotatedPoint.y <= pos.y + this.height / 2;
    }

    draw(ctx, pos, rotation, scaleRatio) {
        var width = this.width;
        var height = this.height;


        var xOff = pos.x;
        var yOff = pos.y;
        ctx.translate(xOff / scaleRatio, yOff / scaleRatio);

        // rotate the rect
        ctx.rotate(-rotation);

        ctx.beginPath();

        var x = -width / 2;
        var y = -height / 2;
        ctx.rect(x / scaleRatio, y / scaleRatio, width / scaleRatio, height / scaleRatio);

        ctx.closePath();

        ctx.rotate(rotation);    
        ctx.translate(-xOff / scaleRatio, -yOff / scaleRatio);

    }

    getRotated(rotation) {
        return this;
    }

    _toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return deepSerialize({
            type: this.type,
            width: this.width,
            height: this.height,
            vertices: this.vertices,
        }, [], smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var vertices = obj.vertices ? obj.vertices : null;
        return new Rectangle(obj.width, obj.height, vertices);
    }

    static initialize() {
        Shape.registerShape("rectangle", Rectangle);
    }

}