
import Game from '../Game'
import GameObject from '../object/GameObject'

import Component from "./Component"

import { deepSerialize, setProperties } from "../tools/Serialize"

class State {

    name : string;
    state : any;

    onProcess(game : Game) {}
    onChangeTo(stateName : State) {}
    onChangeFrom(state : State) {}

    constructor(nam : string, state : any = {}) {
        this.name = name;
        this.state = state;
    }

    toJSON(smartSerialize = false, isRoot = false, variables={}, blockWarning=false) {
        return deepSerialize({
            name: this.name,
            state: this.state,
        }, [], smartSerialize, isRoot, variables, blockWarning);
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new State(obj.name, obj.state);
    }

}

export default class StateController extends Component {

    static State = State;

    defaultState : string;
    currentState : State;

    states : State[];
    stateMap : {string : State} | {};


    constructor(params) {
        super('statecontroller', "controller", params);

        var states = this.states;

        this.stateMap = {};
        states.forEach((state : State) => {
            this.stateMap[state.name] = state;
        })

        this.currentState = this.stateMap[this.defaultState];
    }

    setState(stateName, state=null) {
        var oldState = this.currentState;
        var newState = this.states[stateName];

        if (oldState !== null) {
            oldState.onChangeFrom(newState);
        }

        this.currentState = newState;

        if (state !== null) {
            newState.state = state;
        }

        newState.onChangeTo(oldState);
    }

    onProcess(game : Game) {
        this.currentState.onProcess(game);
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var states = {};
        var stateKeys : any = Object.keys(obj.states);
        for (var i = 0; i < stateKeys; i++) {
            var key = stateKeys[i];
            states[key] = State.fromJSON(obj.states[key]);
        }

        return new StateController({
            states: states,
            defaultState: obj.defaultState
        })
    }

}

Component.registerComponent('statecontroller', StateController);