

import { Game } from "./src/Game.js"

import { GameObject } from "./src/object/GameObject.js"
import { GameObjectContainer } from "./src/object/GameObjectContainer.js"

import { Shape } from "./src/geom/shape/Shape.js"
import { RegularPolygon } from "./src/geom/shape/RegularPolygon.js"

import { Component } from "./src/component/Component.js"
import { Collider } from "./src/component/Collider.js"
import { PhysicsBody } from "./src/component/PhysicsBody.js"
import { ShapeRenderer } from "./src/component/ShapeRenderer.js"


Component.initialize();
Collider.initialize();
PhysicsBody.initialize();
ShapeRenderer.initialize();

var os2d = {};

os2d["Game"] = Game;

os2d["GameObject"] = GameObject;
os2d["GameObjectContainer"] = GameObjectContainer;

os2d["Shape"] = Shape;
os2d["RegularPolygon"] = RegularPolygon;

os2d["Component"] = Component;
os2d["createComponent"] = Component.createComponent;
os2d["Collider"] = Collider;
os2d["PhysicsBody"] = PhysicsBody;
os2d["ShapeRenderer"] = ShapeRenderer;

export { os2d };