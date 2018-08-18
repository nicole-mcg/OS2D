
import Shape from "./Shape.js"
import Point from "../Point.js"

import { deepSerialize } from "../../tools/Serialize.js" 

export default class Circle extends Shape {

    constructor(radius) {
        super("circle", {
            radius: radius,
        }, 10);

        if (this.radius === undefined || this.radius === null) {
            throw "Invalid Circle: radius=" + this.radius;
        }

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get radius() {
        return this.get("radius");
    }

    contains(pos, rotation, otherPos) {
        return pos.distance(otherPos) <= radius;
    }

    draw(ctx, pos, rotation, scaleRatio) {
        ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI*2);
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