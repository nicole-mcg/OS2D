import 'babel-polyfill';

import Game from "./Game"

import GameObject from "./object/GameObject"
import GameObjectContainer from "./object/GameObjectContainer"

import Point from "./geom/Point"
import Shape from "./geom/shape/Shape"
import RegularPolygon from "./geom/shape/RegularPolygon"
import Circle from "./geom/shape/Circle"
import Rectangle from "./geom/shape/Rectangle"

import Component from "./component/Component"
import Collider from "./component/Collider"
import PhysicsBody from "./component/PhysicsBody"
import ShapeRenderer from "./component/ShapeRenderer"
import StateController from "./component/StateController"
import Generator from "./component/Generator"
import DragHandler from "./component/DragHandler"

import UI from "./tools/UI"
import Loader from "./tools/Loader"
import { 
    deepSerialize,
    deserializeVariables,
    replaceVariables,
    setProperties,
    loadFunctions,
} from "./tools/Serialize"

RegularPolygon.initialize();
Circle.initialize();
Rectangle.initialize();

var os2d = {};

os2d["Game"] = Game;

os2d["GameObject"] = GameObject;
os2d["GameObjectContainer"] = GameObjectContainer;

os2d["Point"] = Point;
os2d["Shape"] = Shape;
os2d["RegularPolygon"] = RegularPolygon;
os2d["Circle"] = Circle;
os2d["Rectangle"] = Rectangle;

os2d["Component"] = Component;
os2d["createComponent"] = Component.createComponent;
os2d["Collider"] = Collider;
os2d["PhysicsBody"] = PhysicsBody;
os2d["ShapeRenderer"] = ShapeRenderer;
os2d["StateController"] = StateController;
os2d["State"] = StateController.State;
os2d["Generator"] = Generator;
os2d["DragHandler"] = DragHandler;


os2d["UI"] = UI;
os2d["Loader"] = Loader;
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

(<any>document).os2d = os2d;

console.log(document)

export default os2d;