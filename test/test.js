
import { os2d } from "../index.js"

var game = new os2d.Game(document.getElementById("game-canvas"), 1536, 864, 0.01);


for (var i = 0; i < 125; i++) {

    var rect = new os2d.GameObject();

    rect.x = 0.25 * (i / 2);
    rect.y = 0.5 + Math.random() * 3;

    var shape = new os2d.RegularPolygon(Math.round(3 + 5 * Math.random()), 0.25 + Math.random() * 0.15).getRotated(Math.PI / 90 * i);


    var collider = rect.addComponent(os2d.createComponent("collider", {
        shape: shape
    }));

    var shapeRenderer = rect.addComponent(os2d.createComponent("shaperenderer", {
        shape: shape,
        color: "blue",
        outlineColor: "white",
        outlineWidth: 2
    }));

    shape.rotation = Math.PI / 176;

    rect.addComponent(os2d.createComponent("physicsbody"));

    rect.onClick = function() {
        this.ySpeed -= 1;
        console.log("clicked")
    }

    rect.onProcess = function(game) {
        //this.rotation += Math.PI / 360;
        //this.ySpeed += Math.random() * game.timeDelta * 0.015;
        //this.xSpeed += (Math.random() * 0.1) - 0.05 + 0.0001;
    }

    const _shapeRenderer = shapeRenderer;
    rect.onDrag = function(game) {
        var pos = game.screenCoordToWorld({x: game.mouseX, y: game.mouseY})
        this.x = pos.x;
        this.y = pos.y;
        _shapeRenderer.color = "green";
    }

    game.addGameObject(rect);

}

var rect = new os2d.GameObject();

rect.x = 5
rect.y = 5;

var shape = new os2d.RegularPolygon(4, 2, 2);
shape.rotation = Math.PI / 175;

var collider = rect.addComponent(os2d.createComponent("collider", {
    shape: shape
}));

var shapeRenderer = rect.addComponent(os2d.createComponent("shaperenderer", {
    shape: shape,
    color: "red",
    outlineColor: "white",
    outlineWidth: 2
}));

rect.addComponent(os2d.createComponent("physicsbody", {
    bodyType: "static"
}));

rect.onClick = function() {
    console.log("clicked")
    shapeRenderer.outlineColor = shapeRenderer.outlineColor != "white" ? "white" : "magenta";
}

rect.onProcess = function(game) {
    //this.rotation += Math.PI / 360;
    //this.ySpeed -= Math.random() * 0.315;
    //this.xSpeed += (Math.random() * 0.1) - 0.05 + 0.0001;
}

rect.onDrag = function(game) {
    var pos = game.screenCoordToWorld({x: game.mouseX, y: game.mouseY})
    this.x = pos.x;
    this.y = pos.y;
}

game.addGameObject(rect);


var groundPos = [
    {
        x: 15.36/2,
        y: 15,
        rot: 0
    },
    {
        x: 15.36/2,
        y: -6,
        rot: Math.PI
    },
    {
        x: -5,
        y: 3,
        rot: -Math.PI / 2
    },
    {
        x: 20.25,
        y: 3,
        rot: Math.PI / 2
    }
]
for (var i = 0; i < 4; i++) {
    var ground = new os2d.GameObject();
    ground.x = groundPos[i].x;
    ground.y = groundPos[i].y;

    var groundShape = new os2d.RegularPolygon(4, 18).getRotated(Math.PI + groundPos[i].rot + Math.PI/4);
    ground.addComponent(os2d.createComponent("shaperenderer", {
        shape: groundShape,
        color: "red"
    }));
    ground.addComponent(os2d.createComponent("collider", {
        shape: groundShape
    }))
    ground.addComponent(os2d.createComponent("physicsbody", {
        bodyType: "static"
    }))

    game.addGameObject(ground)
}

game.process(0);