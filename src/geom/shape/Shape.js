import  {Map, List} from "extendable-immutable"

import { Point } from "../Point.js"

import { deepSerialize } from "../../tools/Serialize.js"

export class Shape extends Map {

    constructor(type, vertices) {
        super({
            type: type,
            vertices: new List(vertices)
        });
        //console.log(this.vertices)

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get type() {
        return this.get("type");
    }

    get vertices() {
        return this.get("vertices").toArray();
    }

    // Abstract
    _getVertices() {
        return null;
    }

    // Abstract
    // Should draw from centre
    draw(ctx, x, y, rotation, scaleRatio) {
        console.err("Shape.draw should be implemented by extending class.")
    }

    // Abstract
    contains(x, y, rot, px, py) {
        return false;
    }

    // Abstract
    collides(x, y, rot, other, otherX, otherY, otherRot) {
        return false;
    }

    // Abstract
    getRotated(rotation) {
        return null;
    }

    _toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return deepSerialize({
            type: this.type,
            vertices: this.vertices,
        }, [], smartSerialize, isRoot, variables, blockWarning);
    }

    equals(other) {
        if (!(other instanceof Shape)) {
            return false;
        }

        if (this.type !== other.type || this.vertices.length !== other.vertices.length) {
            return false;
        }

        var vertices = this.vertices
        var otherVertices = other.vertices;
        for (var i = 0; i < vertices.length; i++) {
            if (!vertices[i].equals(otherVertices[i])) {
                return false;
            }
        }

        return true;
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var shapeClass = Shape.registeredShapes[obj.type];

        if (shapeClass) {
            return shapeClass.fromJSON(json)
        }
    }

    static initialize() {
        Shape.registeredShapes = {};
    }

    static registerShape(name, shapeClass) {
        Shape.registeredShapes[name] = shapeClass;
    }

}