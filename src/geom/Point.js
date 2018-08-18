import  {Map} from "extendable-immutable"

export default class Point extends Map {

    constructor(x, y) {
        super({x: x, y: y});

        super.toJSON = this._toJSON;
        this.toJSON = this._toJSON;
    }

    get x() {
        return this.get("x");
    }

    get y() {
        return this.get("y");
    }

    setX(x) {
        return new Point(x, this.y);
    }

    setY(y) {
        return new Point(this.x, y);
    }

    add(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }

    subtract(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }

    scale(scalar) {
        return new Point(this.x * scalar, this.y * scalar);
    }

    rotate(origin, angle) {
        var newP = new Point(this.x - origin.x, this.y - origin.y)

        return new Point(
            newP.x * Math.cos(angle) - newP.y * Math.sin(angle) + origin.x,
            newP.y * Math.cos(angle) + newP.x * Math.sin(angle) + origin.y
        );
    }

    _toJSON() {
        return JSON.stringify({x: this.x, y: this.y});
    }

    equals(other) {
        if (!(other instanceof Point)) {
            return false;
        }

        return this.x == other.x && this.y == other.y;
    }

    static fromJSON(json) {
        json = (typeof json) == 'string' ? JSON.parse(json) : json;
        return Point.from(json);
    }

    // Converts any object with an 'x' and 'y' attribute to a point
    // E.g: var point = Point.from(planck.Vec2(5, 6))
    static from(p) {
        return new Point(p.x, p.y);
    }

    static distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

}