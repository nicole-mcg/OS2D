

import { Game } from "./src/Game.js"

import { GameObject } from "./src/object/GameObject.js"
import { GameObjectContainer } from "./src/object/GameObjectContainer.js"

import { Point } from "./src/geom/Point.js"
import { Shape } from "./src/geom/shape/Shape.js"
import { RegularPolygon } from "./src/geom/shape/RegularPolygon.js"

import { Component } from "./src/component/Component.js"
import { Collider } from "./src/component/Collider.js"
import { PhysicsBody } from "./src/component/PhysicsBody.js"
import { ShapeRenderer } from "./src/component/ShapeRenderer.js"
import { StateController, State } from "./src/component/StateController.js"
import { Generator } from "./src/component/Generator.js"

import { 
    deepSerialize,
    deserializeVariables,
    replaceVariables,
    setProperties,
    loadFunctions,
} from "./src/tools/Serialize.js"

GameObjectContainer.initialize(GameObject);

GameObject.initialize();

Shape.initialize();
RegularPolygon.initialize();

//Initialize component classes
Component.initialize();
Collider.initialize();
PhysicsBody.initialize();
ShapeRenderer.initialize();
StateController.initialize();
Generator.initialize();

var os2d = {};

os2d["Game"] = Game;

os2d["GameObject"] = GameObject;
os2d["GameObjectContainer"] = GameObjectContainer;

os2d["Point"] = Point;
os2d["Shape"] = Shape;
os2d["RegularPolygon"] = RegularPolygon;

os2d["Component"] = Component;
os2d["createComponent"] = Component.createComponent;
os2d["Collider"] = Collider;
os2d["PhysicsBody"] = PhysicsBody;
os2d["ShapeRenderer"] = ShapeRenderer;
os2d["StateController"] = StateController;
os2d["State"] = State;
os2d["Generator"] = Generator;

os2d["deepSerialize"] = deepSerialize;
os2d["deserializeVariables"] = deserializeVariables;
os2d["replaceVariables"] = replaceVariables;
os2d["setProperties"] = setProperties;
os2d["loadFunctions"] = loadFunctions;
os2d["setProperties"] = setProperties;

Game.classes = {};
Object.keys(os2d).forEach(function(key) {
    Game.classes[key] = os2d[key];
});

export { os2d };