
import Shape from "./Shape.js"
import Point from "../Point.js"

import { deepSerialize } from "../../tools/Serialize.js" 

export default class Circle extends Shape {

    constructor(diameter) {
        super({
            radius: diameter / 2,
            diameter
        }, 10);

        if (this.radius === undefined || this.radius === null) {
            throw "Invalid Circle: radius=" + this.radius;
        }

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get type() {
        return 'circle';
    }

    get radius() {
        return this.get("radius");
    }

    get diameter() {
        return this.get("diameter");
    }

    contains(pos, rotation, otherPos) {
        return pos.distance(otherPos) <= this.radius;
    }

    draw(ctx, pos, rotation, scaleRatio) {
        ctx.beginPath();
        ctx.arc(pos.x / scaleRatio, pos.y / scaleRatio, this.radius / scaleRatio, 0, Math.PI*2);
        ctx.closePath();
    }

    getRotated(rotation) {
        return this;
    }

    _toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return deepSerialize({
            type: this.type,
            radius: this.radius
        }, [], smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new Circle(obj.radius);
    }

    static initialize() {
        Shape.registerShape("circle", Circle);
    }

}