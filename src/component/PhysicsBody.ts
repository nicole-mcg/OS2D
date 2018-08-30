
import GameObject from "../object/GameObject"

import Component from "./Component"
import Collider from "./Collider"

import planck from "planck-js"

import Point from "../geom/Point"
import Shape from "../geom/shape/Shape"
import RegularPolygon from "../geom/shape/RegularPolygon"
import Circle from "../geom/shape/Circle"
import Rectangle from "../geom/shape/Rectangle"

import { deepSerialize } from "../tools/Serialize"

function verticesToPlank(vertices) {
    return vertices.map((vertex) => {
        var vec = new planck.Vec2()
        vec.set(vertex.x, -vertex.y);
        return vec;
    })
}

// key = Shape class
// value = function that generates an array of params for Planck class
const SHAPES_TO_PLANCK = {
    circle: (circle) => {return {
        class: planck.Circle,
        params: [circle.radius]
    }},
    rectangle: (rectangle) => {return {
        class: planck.Polygon,
        params: [
            verticesToPlank(rectangle.vertices),
            rectangle.vertices.length
        ]
    }},
    regularpolygon: (regularPolygon) => {
        return {
            class: planck.Polygon,
            params: [
                verticesToPlank(regularPolygon.vertices),
                regularPolygon.vertices.length
            ]
        }
    },

}

export default class PhysicsBody extends Component {

    shape : Shape;
    forcePos : boolean;
    bodyType : string = 'dynamic';
    friction : number = 0.3;
    density : number = 1;

    collider : Collider;
    body : any;
    fixture : any;

    constructor(params) {
        super('physicsbody', "physicsbody", params);

        this.body = null;
        this.fixture = null;

    }

    onAdd(game, gameObject) {
        this.collider = gameObject.getComponent("collider");
        var collider = this.collider;

        if (collider && collider.shape && !this.body) {
            this.shape = collider.shape;

            var bodyDef : any = {};
            bodyDef.position = new planck.Vec2(gameObject.x, gameObject.y);
            bodyDef.type = this.bodyType;

            var body = game.world.createBody(bodyDef);

            var shapeToPlank = null;

            Object.keys(SHAPES_TO_PLANCK).every((shapeType) => {

                if (this.shape.type === shapeType) {
                    shapeToPlank = SHAPES_TO_PLANCK[shapeType](this.shape);
                    return false;
                }

                return true;
            })

            if (!shapeToPlank) {
                console.warn('Invalid shape used in PhysicsBody');
                return false;
            }
            var planckShape = new shapeToPlank['class'](...shapeToPlank.params);

            var fixtureDef : any = {};
            fixtureDef.shape = planckShape;
            fixtureDef.density = this.density;
            fixtureDef.friction = this.friction;

            var fixture = body.createFixture(fixtureDef);

            body.setAngle(gameObject.rotation);

            this.body = body;
            this.fixture = fixture;
        }

        return true;
    }

    onProcess(game) {
        var obj : GameObject = this.gameObject;

        if (!this.collider) {
            if (obj.getComponent("collider")) {
                this.onAdd(game, obj);
                this.onProcess(game);
                return;
            }
            throw "error: GameObject must have a collider for physics processing";
        }
        if (!this.forcePos) {
            var pos = this.body.getPosition();
            obj.pos = Point.from(pos);
            obj.rotation = this.body.getAngle();
            obj.speed = Point.from(this.body.getLinearVelocity());
        } else {
            this.body.setLinearVelocity(planck.Vec2(0, 0));
            this.body.setAngularVelocity(0);
        }
    }

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return super.toJSON(smartSerialize, isRoot, variables, blockWarning, ['forcePos', 'shape', 'collider'])
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new PhysicsBody({
            friction: obj.friction,
            density: obj.density,
            bodyType: obj.bodyType
        });
    }

}

Component.registerComponent('physicsbody', PhysicsBody);