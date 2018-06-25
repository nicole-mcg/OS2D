
import { os2d } from "../index.js"

window.runOS2D = function() {

    var canvas = document.getElementById("game-canvas");

    var recreateGame = function() {
        var game = new os2d.Game(canvas, new os2d.Point(1536, 864), 0.01);

        var lastPos = new os2d.Point(0, 0);
        var mouseVelocity = new os2d.Point(0, 0);

        game.addGameObject(//Add object to game

            os2d.GameObject.create({//Create game object with params:

                components: {//Specify components

                    'generator': {//Generator component params
                        limit: 100,
                        delay: 0,
                        destroyOnComplete: true,
                        onGenerate: function(obj, game) {

                            obj.x = 0.25 * (this.numGenerated / 2);
                            obj.y = 0.5 + Math.random() * 3;
                            obj.rotation = Math.PI / 90 * this.numGenerated;

                            var shape = new game.RegularPolygon(Math.round(3 + 5 * Math.random()), 0.25);

                            obj.addComponent('collider', {shape: shape});
                            obj.addComponent('shaperenderer', {
                                shape: shape,
                                color: 'blue',
                                outlineColor: 'white',
                                outlineWidth: 2
                            });
                            obj.addComponent('physicsbody');

                        },
                        generateParams: {
                            onDragStart: function(game) {
                                this.pos = game.screenCoordToWorld(game.mousePos);

                                this.getComponent("renderer").color = "green";

                                this.state.lastPos = this.pos;
                            },
                            onDrag: function(game) {
                                this.pos = game.screenCoordToWorld(game.mousePos)

                                if (this.state.lastPos) {
                                    game.state.mouseVelocity = this.pos.subtract(this.state.lastPos).scale(game.timeDelta);
                                }

                                this.state.lastPos = this.pos;
                            },
                            onDragEnd: function(game) {
                                this.speed = game.state.mouseVelocity;
                                this.pos = game.screenCoordToWorld(game.mousePos);

                                this.getComponent("renderer").color = "blue";
                            }
                        }
                    }

                }

            })

        );

        var rect = new os2d.GameObject();

        rect.x = 5
        rect.y = 5;

        var shape = new os2d.RegularPolygon(4, 2);
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
            this.getComponent("renderer").outlineColor = shapeRenderer.outlineColor != "white" ? "white" : "magenta";
        }

        rect.onDrag = function(game) {
            this.pos = game.screenCoordToWorld(game.mousePos);
        }

        /*var rect = new os2d.GameObject();

        rect.x = 5
        rect.y = 5;

        var shape = new os2d.RegularPolygon(4, 2);
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
            this.getComponent("renderer").outlineColor = shapeRenderer.outlineColor != "white" ? "white" : "magenta";
        }

        rect.onDrag = function(game) {
            this.pos = game.screenCoordToWorld(game.mousePos);
        }*/

        game.addGameObject(rect);


        var groundPos = [
            {
                x: 15.36/2,
                y: 14.8,
                rot: 0
            },
            {
                x: 15.36/2,
                y: -6.25,
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
            ground.rotation = groundPos[i].rot + Math.PI/4;

            var groundShape = new os2d.RegularPolygon(4, 18);
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

        var printSmart = function() {
            var json = game.toJSON(true);
            console.log(json.json);
            console.log(json.functions)
        }

        var printDumb = function() {
            var json = game.toJSON();
            console.log(json);
        }
        
        printSmart();

        return game;
    }

    var loadFromJSON = function() {

        var loadSmart = function() {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", "/smart.json", false ); // false for synchronous request
            xmlHttp.send( null );

            var obj = JSON.parse(xmlHttp.responseText);

            var functions = {$2: function(t,e){t.x=this.numGenerated/2*.25,t.y=.5+3*Math.random(),t.rotation=Math.PI/90*this.numGenerated;var i=new e.RegularPolygon(Math.round(3+5*Math.random()),.25);t.addComponent("collider",{shape:i}),t.addComponent("shaperenderer",{shape:i,color:"blue",outlineColor:"white",outlineWidth:2}),t.addComponent("physicsbody")},$3: function(t){this.pos=t.screenCoordToWorld(t.mousePos),this.getComponent("renderer").color="green",this.state.lastPos=this.pos},$4: function(t){this.pos=t.screenCoordToWorld(t.mousePos),this.state.lastPos&&(t.state.mouseVelocity=this.pos.subtract(this.state.lastPos).scale(t.timeDelta)),this.state.lastPos=this.pos},$5: function(t){this.speed=t.state.mouseVelocity,this.pos=t.screenCoordToWorld(t.mousePos),this.getComponent("renderer").color="blue"},$8: function(){this.getComponent("renderer").outlineColor="white"!=r.outlineColor?"white":"magenta"},$9: function(t){this.pos=t.screenCoordToWorld(t.mousePos)}};

            os2d.replaceVariables(obj, os2d.deserializeVariables(obj, functions));
            return os2d.Game.fromJSON(canvas, obj);
        }

        var loadDumb = function() {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", "/dumb.json", false ); // false for synchronous request
            xmlHttp.send( null );
            return os2d.Game.fromJSON(canvas, xmlHttp.responseText);
        }

        return loadSmart();
        //return loadDumb();
    }

    //var game = recreateGame();
    var game = loadFromJSON();
    game.process(0);
}

window.runOS2D();