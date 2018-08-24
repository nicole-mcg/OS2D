import  {Map, List} from "extendable-immutable"

import Point from "../Point.js"

import { deepSerialize, setProperties } from "../../tools/Serialize.js"

export default class Shape extends Map {

    //Collision priority represents with Shape should test collision
    //Collision will be testing with the shape with higher priority
    constructor(params, collisionPriority=0) {
        super(setProperties({
            collisionPriority: collisionPriority
        }, params), true);

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get type() {
        return null;
    }

    get collisionPriority() {
        return this.get('collisionPriority');
    }

    // Abstract
    // Should draw from centre
    draw(ctx, pos, rotation, scaleRatio) {
        console.err("Shape.draw should be implemented by extending class.")
    }

    // Abstract
    contains(pos, rot, otherPos) {
        return false;
    }

    collides(pos, rot, otherShape, pos2, rot2) {


        var toCheck, checkRot, checkPos;
        var other, otherRot, otherPos;


        if (this.collisionPriority > otherShape.collisionPriority) {
            toCheck = this;
            other = otherShape;

            checkRot = rot;
            otherRot = rot2;

            checkPos = pos;
            otherPos = pos2;
        } else {
            toCheck = otherShape
            other = this;

            checkRot = rot2;
            otherRot = rot;

            checkPos = pos2;
            otherPos = pos;
        }

        var vertices = other.vertices;
        var collides = false;

        if (vertices) {
            for (var i = 0; i < vertices.length; i++) {
                if (toCheck.contains(checkPos, checkRot, otherPos)) {
                    collides = true;
                    break;
                }
            }
        }

        return collides;
    }

    get vertices() {
       return this.get('vertices') 
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