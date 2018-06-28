
import Component from "./Component.js"
import Point from "../geom/Point.js"

export default class DragHandler extends Component {

    constructor(params) {
        super(DragHandler.componentName, "draghandler", params);

        this.dragging = false;
        this.mouseVelocity = new Point(0, 0);
        this.lastVelocities = [];
        this.lastPos = new Point(0, 0);  
    }

    onObjDragStart(obj, game) {

        this.dragging = true;
        this.lastPos = obj.pos;
        this.lastVelocities = [];
    }

    onObjDrag(obj, game) {

        obj.pos = game.screenCoordToWorld(game.mousePos);

        var frameVel = obj.pos.subtract(this.lastPos);
        this.lastVelocities.push(frameVel);

        if (this.lastVelocities.length > DragHandler.MAX_VEL_FRAMES) {
            this.lastVelocities.shift();
        }

        this.mouseVelocity = new Point(0, 0);
        for (var i = 0; i < this.lastVelocities.length; i++) {
            this.mouseVelocity = this.mouseVelocity.add(this.lastVelocities[i]);
        }
        this.mouseVelocity = this.mouseVelocity.scale(game.timeDelta/(this.lastVelocities.length));

        this.lastPos = obj.pos;
    }

    onObjDragEnd(obj, game) {
        
        if (this.throwable) {
            var physicsBody = obj.getComponent('physicsbody');
            if (physicsBody && physicsBody.bodyType === 'dynamic') {
                obj.speed = this.mouseVelocity;
            }
        }
        this.dragging = false;
    }

    onAdd(game, gameObject) {
        gameObject.onDragStart = this.onObjDragStart.bind(this);
        gameObject.onDrag = this.onObjDrag.bind(this);
        gameObject.onDragEnd = this.onObjDragEnd.bind(this);
        this.lastPos = gameObject.pos;
    }

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return super.toJSON(smartSerialize, isRoot, variables, blockWarning, ['dragging', 'mouseVelocity', 'lastVelocities', 'lastPos'])
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new ShapeRenderer({
            shape: Shape.fromJSON(obj.shape),
            color: obj.color,
            outlineColor: obj.outlineColor,
            outlineWidth: obj.outlineWidth
        });
    }

    static initialize() {
        DragHandler.componentName = "draghandler"
        DragHandler.validParams = {
            "onDragStart": Function,
            "onDrag": Function,
            "onDragEnd": Function,
            "throwable": "boolean"
        };
        DragHandler.defaultParams = {
            "throwable": false,
        }
        DragHandler.MAX_VEL_FRAMES = 2;
        Component.addComponent(DragHandler);
    }

}