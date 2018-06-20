
import { Shape } from "./Shape.js"

export class RegularPolygon extends Shape {

    constructor(numSides, size) {
        super();
        this.numSides = numSides;
        this.size = size;
    }

    _getVertices() {
        var vertices = [];

        var numSides = this.numSides;
        var size = this.size;

        var x = 0;
        var y = 0;

        var sliceAngle = Math.PI*2 / numSides;
        var internalAngle = (numSides - 2) * Math.PI / (numSides * 2);

        var distance = size / 2;
        var currAngle = -Math.PI/2;

        for (var i = 0; i < numSides; i++) {
            x = distance * Math.cos(currAngle);
            y = distance * Math.sin(currAngle);

            vertices.push({x: x, y: y});

            currAngle += sliceAngle;
        }

        return vertices;
    }

    contains(x, y, rotation, px, py) {
        px -= x;
        py -= y;
        var vertices = this.vertices;

        var p0 = {
            x: 0,
            y: 0
        }

        var q = [];
        var c = Math.cos(rotation);
        var s = Math.sin(rotation)
        for (var i = 0; i < vertices.length; i++) {

            var curr = vertices[i];
            var next = vertices[i + 1];

            if (i == vertices.length - 1) {
                next = vertices[0];
            }

            var p = {
                x: curr.x + next.x,
                y: curr.y + next.y
            }

            q[i] = {
                x: p.x * c - p.y * s,
                y: p.x * s + p.y * c
            }
        }

        this.q = q;

        //console.log(distanceFromCenter)

        var distanceFromCenter = Math.sqrt(Math.pow(p0.x - px, 2) + Math.pow(p0.y - py, 2));

        for (var i = 0; i < q.length; i++) {
            var distance = Math.sqrt(Math.pow(q[i].x - px, 2) + Math.pow(q[i].y - py, 2));

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
        var c = Math.cos(rotation);
        var s = Math.sin(rotation);
        for (var i = 0; i < numSides; i++) {
            var p = vertices[i];
            
            var p2 = {
                x: p.x * c - p.y * s,
                y: p.x * s + p.y * c
            }

            ctx[i == 0 ? "moveTo" : "lineTo"]((p2.x + x) / scaleRatio, (p2.y + y) / scaleRatio);
        }

        ctx.closePath();

        ctx.fill();

        if (this.q !== undefined && this.q !== null) {
            var fill = ctx.fillStyle;
            ctx.fillStyle = "green";
            for (var i = 0; i < this.q.length; i++) {
                ctx.fillRect((this.q[i].x + x) / scaleRatio - 1, (this.q[i].y + y) / scaleRatio - 1, 3, 3)
            }
            ctx.fillStyle = fill;
        }
    }

    getRotated(rotation) {
        var c = Math.cos(rotation);
        var s = Math.sin(rotation);

        var vertices = this.vertices;
        var newVertices = [];

        vertices.forEach((v) => {
            newVertices.push({
                x: v.x * c - v.y * s,
                y: v.x * s + v.y * c
            })
        })

        var newShape = new RegularPolygon(this.numSides, this.size);
        newShape._vertices = newVertices

        return newShape;
    }

}