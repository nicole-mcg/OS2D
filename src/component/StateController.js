
import Component from "./Component.js"

export default class StateController extends Component {

    constructor(params) {
        super(StateController.componentName, "controller", params);

        var states = this.states;
        var newStates = {};
        console.log(states)
        states.forEach((state) => {
            newStates[state.name] = state;
        })

        this.currentState = this.defaultState;
    }

    setState(stateName, state=null) {
        var oldState = this.currentState;
        var newState = this.states[stateName];

        if (oldState !== null && oldState.onChangeFrom !== undefined && oldState.onChangeFrom !== null) {
            oldState.onChangeFrom(newState);
        }

        this.currentState = newState;

        if (state !== null) {
            newState.state = state;
        }

        if (newState.onChangeTo !== undefined && newState.onChangeTo !== null) {
            newState.onChangeTo(oldState);
        }
    }

    onProcess(obj, game) {
        if (this.currentState.onProcess !== undefined && this.currentState.onProcess !== null) {
            this.currentState.onProcess(game);
        }
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        var states = {};
        var stateKeys = Object.keys(obj.states);
        for (var i = 0; i < stateKeys; i++) {
            var key = stateKeys[i];
            states[key] = State.fromJSON(obj.states[key]);
        }

        return new StateController({
            states: states,
            defaultState: obj.defaultState
        })
    }

    static initialize() {
        StateController.componentName = "statecontroller";
        StateController.validParams = {
            "states": Array,
            "defaultState": 'string',
        };
        Component.addComponent(StateController);
    }

}

class State {

    //Name should be string, state should be an object
    constructor(name, state={}) {
        this.name = name;
        this.state = state;

        //this.onChangeTo = undefined;
        //this.onChangeFrom = undefined;
        //this.onProcess = undefined;
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

StateController.State = State;