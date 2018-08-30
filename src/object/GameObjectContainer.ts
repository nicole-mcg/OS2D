import Game from '../Game'
import GameObject from './GameObject'

import Point from '../geom/Point'

export default class GameObjectContainer {

    _children : GameObject[];
    
    constructor() {
        this._children = [];
    }

    get game() : Game {
        return null
    }

    get fixedPosition() : boolean {
        return true;
    }

    get drawPos() : Point {
        return null
    }

    addGameObject(gameObject : GameObject) : void {
        
        this._children.push(gameObject);

        gameObject.parent = this;
    }

    hasGameObject(gameObject : GameObject) : boolean {
        return this._children.includes(gameObject);
    }

    preprocess(game : Game) : void {
        this._children.forEach((child) => {
            child.preprocess(game);
        })
    }

    process(game : Game) : void {
        this._children.forEach((child) => {
            child.process(game);
        })
    }

    postprocess(game : Game) : void {
        this._children.forEach((child) => {
            child.postprocess(game);
        })
    }

    predraw(game : Game, ctx : CanvasRenderingContext2D) : void {
        this._children.forEach((child) => {
            child.predraw(game, ctx);
        })
    }

    draw(game : Game, ctx : CanvasRenderingContext2D) : void {
        this._children.forEach((child) => {
            child.draw(game, ctx);
        })
    }

    postdraw(game : Game, ctx : CanvasRenderingContext2D) : void {
        this._children.forEach((child) => {
            child.postdraw(game, ctx);
        })
    }

}