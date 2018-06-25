
import { Component } from "./Component.js"
import planck from "planck-js"

import { Point } from "../geom/Point.js"

import { deepSerialize } from "../tools/Serialize.js"

export class PhysicsBody extends Component {

    constructor(params) {
        super(PhysicsBody.componentName, "physicsbody", params);

        this.forcePos = false;

        this.body = null;
        this.fixture = null;

    }

    onAdd(game, gameObject) {
        this.collider = gameObject.getComponent("collider");
        var collider = this.collider;

        if (collider && collider.shape) {
            this.shape = collider.shape;

            var bodyDef = {};
            bodyDef.position = new planck.Vec2(gameObject.x, gameObject.y);
            bodyDef.type = this.bodyType;

            var body = game.world.createBody(bodyDef);

            var planckVertices = [];
            this.shape.vertices.forEach((vertex) => {
                var vec = new planck.Vec2()
                vec.set(vertex.x, -vertex.y);
                planckVertices.push(vec)
            })

            var planckShape = new planck.Polygon(planckVertices, planckVertices.length);

            var fixtureDef = {};
            fixtureDef.shape = planckShape;
            fixtureDef.density = this.density;
            fixtureDef.friction = this.friction;

            var fixture = body.createFixture(fixtureDef);

            body.setAngle(gameObject.rotation);

            this.body = body;
            this.fixture = fixture;
        }
    }

    onProcess(game) {
        if (!this.collider) {
            if (gameObject.getComponent("collider")) {
                onAdd(game, this.gameObject);
                onProcess(game);
            }
            throw "error: GameObject must have a collider for physics processing";
        }
        if (!this.forcePos) {
            var pos = this.body.getPosition();
            this.gameObject.pos = Point.from(pos);
            this.gameObject.rotation = this.body.getAngle();
            this.gameObject.speed = Point.from(this.body.getLinearVelocity());
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

    static initialize() {
        PhysicsBody.componentName = "physicsbody";
        PhysicsBody.validParams = {
            "friction": 'number',
            "density": 'number',
            "bodyType": ["dynamic", "static"],
        };
        PhysicsBody.defaultParams = {
            "friction": 0.3,
            "density": 1,
            "bodyType": "dynamic"
        }
        Component.addComponent(PhysicsBody);
    }

}