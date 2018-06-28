
import Shape from "./Shape.js"
import Point from "../Point.js"

import { deepSerialize } from "../../tools/Serialize.js" 

export default class RegularPolygon extends Shape {

    constructor(numSides, size, vertices=null) {
        super("regularpolygon", {
            numSides: numSides,
            size: size,
            vertices: vertices != null ? vertices : function() {
                var vertices = [];

                var x = 0;
                var y = 0;

                var sliceAngle = Math.PI*2 / numSides;
                var internalAngle = (numSides - 2) * Math.PI / (numSides * 2);

                var distance = size / 2;
                var currAngle = Math.PI/2;

                for (var i = 0; i < numSides; i++) {
                    x = distance * Math.cos(-currAngle);
                    y = -distance * Math.sin(-currAngle);

                    vertices.push(new Point(x, y));

                    currAngle += sliceAngle;
                }

                return vertices;
            }
        }());

        if (this.numSides === undefined || this.numSides === null || 
            this.size === undefined || this.size === null ||
            this.vertices === undefined || this.vertices === null || this.vertices.length === 0) {
            throw "Invalid RegularPolygon: numSides=" + this.numSides + " size=" + this.size + (this.vertices ? " numVertices=" + this.vertices.length : "");
        }

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get numSides() {
        return this.get("numSides");
    }

    get size() {
        return this.get("size");
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

        //this.q = q;

        //console.log(distanceFromCenter)

        var distanceFromCenter = Point.distance(p0, p);

        for (var i = 0; i < q.length; i++) {
            var distance = Point.distance(q[i], p);

            if (distance < distanceFromCenter) {
                return false;
            }
        }

        return true;
    }

    draw(ctx, x, y, rotation, scaleRatio) {
        var numSides = this.numSides;
        var size = this.size;
        var vertices = this.vertices;

        
  
        ctx.beginPath();


        ctx.moveTo((vertices[0].x + x) / scaleRatio, (vertices[0].y + y) / scaleRatio);
        var c = Math.cos(-rotation);
        var s = Math.sin(-rotation);
        for (var i = 0; i < numSides; i++) {
            var p = vertices[i];
            
            var p2 = new Point(p.x * c - p.y * s, p.x * s + p.y * c);

            ctx[i == 0 ? "moveTo" : "lineTo"]((p2.x + x) / scaleRatio, (p2.y + y) / scaleRatio);
        }

        ctx.closePath();

        

        /*if (this.q !== undefined && this.q !== null) {
            var fill = ctx.fillStyle;
            ctx.fillStyle = "green";
            for (var i = 0; i < this.q.length; i++) {
                ctx.fillRect((this.q[i].x + x) / scaleRatio - 1, (this.q[i].y + y) / scaleRatio - 1, 3, 3)
            }
            ctx.fillStyle = fill;
        }*/
    }

    getRotated(rotation) {
        var c = Math.cos(rotation);
        var s = Math.sin(rotation);

        var vertices = this.vertices;
        var newVertices = [];

        vertices.forEach((v) => {
            newVertices.push(new Point(v.x * c - v.y * s, v.x * s + v.y * c));
        })

        var newShape = new RegularPolygon(this.numSides, this.size, newVertices);
        

        return newShape;
    }

    _toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return deepSerialize({
            type: this.type,
            numSides: this.numSides,
            size: this.size,
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

        return new RegularPolygon(obj.numSides, obj.size, vertices);
    }

    static initialize() {
        Shape.registerShape("regularpolygon", RegularPolygon);
    }

}