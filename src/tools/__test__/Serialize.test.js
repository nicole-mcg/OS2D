
require('jest')
require('jest-canvas-mock')
var os2d = require('../../../index.js');
os2d = os2d.os2d

test('tests deepSerialize smartSerialize=false', () => {
    var warn = console.warn;
    console.warn = jest.fn();

    var obj = createObjToSerialize();

    var toMatch = {
        "arr": [
            {"test": "arr works"},
            "here's a string",
            "function () {return \"arr.func\";}",
            7
        ],
        "obj": {
            "str": "obj works",
            "func": "function func() {return \"obj.func\";}",
            "num": 4
        },
        "num": 0,
        bool: true,
        json: "toJSON in deepSerialize works!",
        point: {x: 0, y: 0},
    }

    var json = os2d.deepSerialize(obj, ['ignore']);

    expect(json).toEqual(JSON.stringify(toMatch));

    //Warning for serializing functions to JSON
    expect(console.warn.mock.calls.length).toBe(1);

    console.warn = warn;

})

// Split up these tests so it's easier to see what failed
test('tests deepSerialize smartSerialize=true isroot=false', () => {
    testSmartSerialize(false);
})
test('tests deepSerialize smartSerialize=true isroot=true', () => {
    testSmartSerialize(true);
})

test('tests setProperties', () => {

    var obj = new TestClass();
    var properties = {
        func: function() {
            expect(this).toBe(obj);
        },
        point: {
            x: 25,
            y: 25
        },
        parentGetter: 'test1',
        childGetter: 'test2',
    }


    os2d.setProperties(obj, properties);

    var toMatch = {
        parentGetter: 'test1',
        childGetter: 'test2',
        func: properties.func.bind(obj),
        point: new os2d.Point(25, 25),
        _parentGetter: 'test1',
        _childGetter: 'test2',
    }

    Object.keys(toMatch).forEach((key) => {
        var value = toMatch[key];
        if (key === 'func') {
            expect(value).not.toBeNull();
            return;
        }

        expect(value).toEqual(obj[key]);
    })
});

test('tests deserializeVariables', () => {

    var variables = createVariables();
    var obj = {
        variables: {
            $0: {
                type: 'regularpolygon',
                numSides: 3,
                size: 1
            },
            $1: {
                x: 50,
                y: 50,
            },
            $2: variables.$2
        },

        should: "not",
        be: "in",
        _variables: "obj"

    }

    var deserialized = os2d.deserializeVariables(obj, {$2: variables.$2});

    expect(obj.variables).toBeUndefined();

    expect(deserialized.variables).toEqual(variables);

});

test('tests replaceVariables', () => {


    var obj = createObj();
    var variables = createVariables(obj);
    var templates = createTemplates();

    os2d.replaceVariables(obj, {variables, templates})

    var keys = Object.keys(variables);

    //Make sure our object got populated correctly
    expect(obj.shape).toBe(variables['$0']);
    expect(obj.point).toBe(variables['$1']);
    expect(obj.func).toBe(variables['$2']);

    obj.func();

});

test('tests loadFunctions', () => {
    var warn = console.warn;
    console.warn = jest.fn();

    var functions = {
        test: {
            test: {
                test: 'function(){return "worked1";}'
            }
        },
        x: 'function(){return "worked2";}'
    }

    var convertedFunctions = JSON.parse(JSON.stringify(functions));

    os2d.loadFunctions(convertedFunctions);

    // Verify our old ones are still there
    expect(typeof functions.test.test.test).toBe('string')
    expect(typeof functions.x).toBe('string')

    // Make sure we got functions back
    expect(convertedFunctions.test.test.test).toBeInstanceOf(Function);
    expect(convertedFunctions.x).toBeInstanceOf(Function);

    expect(convertedFunctions.test.test.test()).toBe('worked1');
    expect(convertedFunctions.x()).toBe('worked2');

    //Make sure we got a warning for using this :)
    expect(console.warn.mock.calls.length).toBe(2);

    console.warn.mockClear();

    functions.y = "function(){shouldn't work}"

    var error = null;
    try {
        os2d.loadFunctions(functions);
    } catch (e) {
        expect(e.startsWith('Error creating function from String name=')).toBe(true);
        error = e;
    }

    // Make sure we got an error
    expect(error).not.toBeNull();

    console.warn = warn;
});

function createObjToSerialize() {
    return {
        arr: [
            {test: 'arr works'},
            "here's a string",
            function(){return "arr.func";},
            7
        ],
        obj: {
            str: 'obj works',
            func: function(){return "obj.func";},
            num: 4
        },
        ignore: "shouldn't exist",
        num: 0,
        bool: true,
        json: {
            "these": "shouldn't show",
            "toJSON": function() {
                return '"toJSON in deepSerialize works!"';
            }
        },
        point: new os2d.Point(0, 0),
    };
}


// START OF USAGE FUNCTIONS (not tests)


function testSmartSerialize(isRoot) {
    var obj = createObjToSerialize();

    var variables = isRoot ? {} : {
        functions: {
            $1: function() {
                return "arr.func";
            },
            $2: function func() {
                return "obj.func";
            }
        }
    };

    var json = os2d.deepSerialize(obj, ['ignore'], true, isRoot, variables);

    var toMatch;
    if (!isRoot) {
        expect(json).toEqual("{\"arr\":[{\"test\":\"arr works\"},\"here's a string\",\"$3\",7],\"obj\":{\"str\":\"obj works\",\"func\":\"$4\",\"num\":4},\"num\":0,\"bool\":true,\"json\":\"toJSON in deepSerialize works!\",\"point\":\"&5\"}");
    } else {
        expect(json.json).toEqual("{\"arr\":[{\"test\":\"arr works\"},\"here\'s a string\",\"$1\",7],\"obj\":{\"str\":\"obj works\",\"func\":\"$2\",\"num\":4},\"num\":0,\"bool\":true,\"json\":\"toJSON in deepSerialize works!\",\"point\":\"&3\",\"variables\": {\"$3\":{\"x\":0,\"y\":0}}}");
        expect(json.functions).toEqual("var functions = {$1: function () {return \"arr.func\";},$2: function func() {return \"obj.func\";}};");
    }
}

//Has a getter and parent for testing
class TestClassBase {
    get parentGetter() {
        return this._parentGetter;
    }
}
class TestClass extends TestClassBase {
    get childGetter() {
        return this._childGetter;
    }
}

function createVariables(obj=null) {
    return {
        '$0': new os2d.RegularPolygon(3, 1),
        '$1': new os2d.Point(50, 50),
        '$2': function() {
            //Make sure this function is bound correctly
            expect(this).toBe(obj);
        }
    };
}

function createTemplates(obj) {
    return {
        '$0': {//These are different from createVariables
            type: os2d.Point,
            value: {
                x: 100,
                y: 100,
            },
        },
        '$1': {
            type: os2d.Shape,
            value: {
                type: 'regularpolygon',
                numSides: 4,
                size: 0.5,
            }
        },
        '$2': {
            type: Function,
            value: function() {
                console.log("worked");
            }
        }
    };
}

function createObj() {
    return {
        shape: '$0',
        point: '$1',
        func: '$2'
    };
}
