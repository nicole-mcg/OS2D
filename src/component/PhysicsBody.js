
import { Component } from "./Component.js"
import planck from "planck-js"

export class PhysicsBody extends Component {

    constructor(params) {
        super(PhysicsBody.name, "physicsbody");
    
        this.friction = 0.3;
        if (Object.keys(params).includes("friction")) {
            this.friction = params.friction;
        }

        this.density = 1;
        if (Object.keys(params).includes("density")) {
            this.density = params.density;
        }

        this.bodyType = "dynamic";
        if (Object.keys(params).includes("bodyType")) {
            this.bodyType = params.bodyType;
        }

        this.forcePos = false;

        this.body = null;
        this.fixture = null;

    }

    onAdd(game, gameObject) {
        var collider = gameObject.getComponent("collider");

        if (collider == null) {
            console.err("GameObject must have a collider for physics processing");
        }

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

        this.body = body;
        this.fixture = fixture;
    }

    onProcess(game) {
        if (!this.forcePos) {
            var pos = this.body.getPosition();
            this._gameObject.x = pos.x;
            this._gameObject.y = pos.y;
            this._gameObject.rotation = this.body.getAngle();
        } else {
            this.body.setLinearVelocity(planck.Vec2(0, 0));
            this.body.setAngularVelocity(0)
        }
    }

    static get name() {
        return "physicsbody";
    }

    static initialize() {
        Component.addComponent(PhysicsBody);
    }

}