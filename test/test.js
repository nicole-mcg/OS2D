const os2d = document.os2d; 
console.log(document)

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
                        limit: 50,
                        delay: 0,
                        destroyOnComplete: true,
                        onGenerate: function(obj, game, generator) {

                            obj.x = 0.25 * (generator.numGenerated / 2);
                            obj.y = 0.5 + Math.random() * 3;
                            obj.rotation = Math.PI / 90 * generator.numGenerated;

                            var shape;
                            switch(Math.floor(Math.random() * 2.9)) {

                                case 0:
                                    shape = new game.RegularPolygon(4, 0.5)//Math.round(3 + 5 * Math.random()), 0.5);
                                    break

                                case 1:
                                    shape = new game.Rectangle(0.5, 0.5);
                                    break

                                case 2:
                                    shape = new game.Circle(0.5);
                                    break;

                            }

                            obj.addComponent('collider', {shape: shape});
                            obj.addComponent('shaperenderer', {
                                shape: shape,
                                color: 'blue',
                                outlineColor: 'white',
                                outlineWidth: 2
                            });

                        },
                        generateParams: {
                            'components': {
                                'physicsbody': {},
                                'draghandler': {throwable: true}
                            }
                        }
                    }

                }

            })

        );

        var shape = new os2d.RegularPolygon(4, 2);

        var rect = os2d.GameObject.create({
            pos: {
                x: 5,
                y: 5
            },
            components: {
                collider: {
                    shape: shape
                },
                shaperenderer: {
                    shape: shape,
                    color: 'red',
                    outlineColor: 'white',
                    outlineWidth: 2
                },
                physicsbody: {
                    bodyType: 'static'
                },
                draghandler: {throwable: true}
            },
            onClick: function(game) {
                this.getComponent("renderer").outlineColor = shapeRenderer.outlineColor != "white" ? "white" : "magenta";
            }
        });

        game.addGameObject(rect);

        var groundPos = [
            {
                x: -15.36 / 2,
                y: 15.36
            },
            {
                x: -15.36/2,
                y: -15.36/2
            },
            {
                x: 15.36/2,
                y: -15.36/2
            },
            {
                x: 15.36/2,
                y: 15.36
            }
        ]

        var shape = new os2d.Rectangle(15.36, 15.36);
        var shapeRendererParams = {
          shape: shape,
          color: "red"
        };
        for (var i = 0; i < groundPos.length; i++) {
            game.addGameObject(
                os2d.GameObject.create({
                    pos: os2d.Point.from(groundPos[i]),
                    components: {
                        shapeRenderer: shapeRendererParams,
                        collider: { shape: shape },
                        physicsbody: { bodyType: "static" }
                    },
                    onMouseOver: (game) => {
                        console.log(this, game)
                        //if (!this) throw 'e';
                        //this.getComponent('renderer').color = 'green';
                    },
                    onMouseOut: () => {
                        //this.getComponent('renderer').color = 'red';
                    }
                })
            );
        }


        shape = new os2d.Rectangle(2, 2);

        rect = os2d.GameObject.create({
            pos: {
                x: 0,
                y: 0
            },
            components: {
                collider: {
                    shape: shape
                },
                shaperenderer: {
                    shape: shape,
                    color: 'green',
                    outlineColor: 'white',
                    outlineWidth: 2
                },
                physicsbody: {
                    bodyType: 'static'
                },
                draghandler: {throwable: true}
            },
            onClick: function(game) {
                this.getComponent("renderer").outlineColor = shapeRenderer.outlineColor != "white" ? "white" : "magenta";
            }
        });

        game.addGameObject(rect);
        
        var printSmart = function() {
            var json = game.toJSON(true);
            console.log(json.json);
            console.log(json.functions)
        }

        var printDumb = function() {
            var json = game.toJSON();
            console.log(json);
        }
        
        //printSmart();

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

    /*var loader = new os2d.Loader('smart.json', 'img/square_pig.jpg', 'dumb.json', 'build.js', 'img/big.jpg', 'test_files.zip');

    loader.onProgress = function(percent, loaded, total) {
        console.log(percent, loaded, total);
    }

    loader.onComplete = function(files) {
        console.log('complete!')
    }

    loader.start();*/

    var game = recreateGame();
    //var game = loadFromJSON();
    game.process(0);

    return game;
}

window.runOS2D();