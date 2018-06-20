

export class Shape {

    constructor() {
        this._vertices = null;
    }

    get vertices() {
        if (this._vertices == null) {
            this._vertices = this._getVertices();
        }

        return this._vertices;
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

}