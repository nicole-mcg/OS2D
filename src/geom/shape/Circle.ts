
import Shape from "./Shape"
import Point from "../Point"

import { deepSerialize } from "../../tools/Serialize" 

export default class Circle extends Shape {

    constructor(diameter) {
        super({
            radius: diameter / 2,
            diameter
        }, 10);

        if (this.radius === undefined || this.radius === null) {
            throw "Invalid Circle: radius=" + this.radius;
        }
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

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
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