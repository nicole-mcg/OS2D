
import Shape from "./Shape"
import Point from "../Point"

import { deepSerialize } from "../../tools/Serialize" 

export default class RegularPolygon extends Shape {

    constructor(numSides, diameter, vertices=null) {
        super({
            numSides: numSides,
            diameter: diameter,
            vertices: vertices != null ? vertices : function() {
                var vertices = [];

                var x = 0;
                var y = 0;

                var sliceAngle = Math.PI * 2 / numSides;
                var sideLength = Math.tan(sliceAngle / 2) * (diameter / 2) * 2;
                var distance = sideLength / 2 / Math.sin(sliceAngle / 2)
                //var distance = diameter / 2;

                var currAngle = Math.PI / 2;

                for (var i = 0; i < numSides; i++) {
                    x = distance * Math.cos(-currAngle);
                    y = -distance * Math.sin(-currAngle);

                    vertices.push(new Point(x, y));

                    currAngle += sliceAngle;
                }
                
                return vertices;
            }()
        });

        if (this.numSides === undefined || this.numSides === null || 
            this.diameter === undefined || this.diameter === null ||
            this.vertices === undefined || this.vertices === null || this.vertices.length === 0) {
            throw "Invalid RegularPolygon: numSides=" + this.numSides + " size=" + this.diameter + (this.vertices ? " numVertices=" + this.vertices.length : "");
        }

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get type() {
        return "regularpolygon";
    }

    get numSides() {
        return this.get("numSides");
    }

    get diameter() {
        return this.get("diameter");
    }

    contains(pos, rotation, otherPos) {
        var p = new Point(otherPos.x - pos.x, otherPos.y - pos.y);
        var vertices = this.vertices;

        var p0 = new Point(0, 0);

        var q = [];
        var c = Math.cos(rotation);
        var s = Math.sin(rotation)
        for (var i = 0; i < vertices.length; i++) {

            var curr = vertices[i];
            var next = vertices[i + 1];

            if (i == vertices.length - 1) {
                next = vertices[0];
            }

            var tmp = new Point(curr.x + next.x, curr.y + next.y);

            q[i] = new Point(tmp.x * c - tmp.y * s, -tmp.x * s - tmp.y * c);
        }

        var distanceFromCenter = Point.distance(p0, p);

        for (var i = 0; i < q.length; i++) {
            var distance = Point.distance(q[i], p);

            if (distance < distanceFromCenter) {
                return false;
            }
        }

        return true;
    }

    draw(ctx, pos, rotation, scaleRatio) {
        var numSides = this.numSides;
        var size = this.diameter;
        var vertices = this.vertices;

        ctx.beginPath();

        ctx.moveTo((vertices[0].x + pos.x) / scaleRatio, (vertices[0].y + pos.y) / scaleRatio);
        var c = Math.cos(-rotation);
        var s = Math.sin(-rotation);
        for (var i = 0; i < numSides; i++) {
            var p = vertices[i];
            
            var p2 = new Point(p.x * c - p.y * s, p.x * s + p.y * c);

            ctx[i == 0 ? "moveTo" : "lineTo"]((p2.x + pos.x) / scaleRatio, (p2.y + pos.y) / scaleRatio);
        }

        ctx.closePath();
    }

    getRotated(rotation) {
        var c = Math.cos(rotation);
        var s = Math.sin(rotation);

        var vertices = this.vertices;
        var newVertices = [];

        vertices.forEach((v) => {
            newVertices.push(new Point(v.x * c - v.y * s, v.x * s + v.y * c));
        })

        var newShape = new RegularPolygon(this.numSides, this.diameter, newVertices);
        

        return newShape;
    }

    _toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return deepSerialize({
            type: this.type,
            numSides: this.numSides,
            diameter: this.diameter,
            vertices: this.vertices
        }, [], smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var vertices = null;
        if (obj.vertices) {
            vertices = [];
            for (var i = 0; i < obj.vertices.length; i++) {
                vertices.push(Point.from(obj.vertices[i]));
            }
        }

        return new RegularPolygon(obj.numSides, obj.diameter, vertices);
    }

    static initialize() {
        Shape.registerShape("regularpolygon", RegularPolygon);
    }

}