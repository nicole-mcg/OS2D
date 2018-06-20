
import { Game } from "../Game.js"

export class GameObjectContainer {
    
    constructor() {
        this._children = [];
    }

    addGameObject(gameObject) {
        this._children.push(gameObject);
        gameObject.parent = this;
    }

    hasGameObject(gameObject) {
        return this._children.includes(gameObject);
    }

    preprocess(game) {
        this._children.forEach((child) => {
            child.preprocess(game);
        })
    }

    process(game) {
        this._children.forEach((child) => {
            child.process(game);
        })
    }

    postprocess(game) {
        this._children.forEach((child) => {
            child.postprocess(game);
        })
    }

    predraw(game, ctx) {
        this._children.forEach((child) => {
            child.predraw(game, ctx);
        })
    }

    draw(game, ctx) {
        this._children.forEach((child) => {
            child.draw(game, ctx);
        })
    }

    postdraw(game, ctx) {
        this._children.forEach((child) => {
            child.postdraw(game, ctx);
        })
    }

}