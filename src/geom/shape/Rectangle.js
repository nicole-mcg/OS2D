
import Shape from "./Shape.js"
import Point from "../Point.js"

import { deepSerialize } from "../../tools/Serialize.js" 

export default class Rectangle extends Shape {

    constructor(width, height) {
        super("rectangle", {
            width: width,
            height: height
            vertices: (function() {
                return [
                    {
                        x: -width / 2,
                        y: height / 2
                    },
                    {
                        x: width / 2,
                        y: height / 2,
                    },
                    {
                        x: width / 2,
                        y: -height / 2
                    },
                    {
                        x: -width / 2,
                        y: -height / 2, 
                    }

                ]
            })()
        }, 5);

        if (this.width === undefined || this.width === null ||
            this.height === undefined || this.height === null) {
            throw "Invalid Rectangle: width=" + this.width + " height=" + this.height;
        }

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get width() {
        return this.get("width");
    }

    get height() {
        return this,get('height');
    }

    contains(pos, rotation, otherPos) {
        var rotatedPoint = otherPos.rotate(pos, rotation);

        return rotatedPoint.x >= pos.x && rotatedPoint.y >= pos.y &&
            rotatedPoint.x <= pos.x + this.width && rotatedPoint.y <= pos.y + this.height;
    }

    draw(ctx, pos, rotation, scaleRatio) {
        var width = this.width;
        var height = this.height;

        ctx.save();

        ctx.translate(pos.x + width / 2, pos.y + height / 2);

        // rotate the rect
        ctx.rotate(rotation);

        ctx.rect(-width / 2, -height / 2, width, height);
    
        ctx.restore();
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