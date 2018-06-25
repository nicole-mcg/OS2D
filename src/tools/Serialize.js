import { Shape } from "../geom/shape/Shape.js"
import { Point } from "../geom/Point.js"

const IMMUTABLE_TYPES = [
    [Shape, [{type: "regularpolygon"}, 'numSides', 'size'], ["type", "vertices"]],
    [Point, ["x", "y"]]
];
export function deepSerialize(obj, keysToIgnore=[], smartSerialize=false, isRoot=true, variables={}, blockWarning=false) {
    var string = "";

    var getNextIndex = function(variables) {
        return Object.keys(variables).length + (variables.functions ? Object.keys(variables.functions).length : 0);
    }
    if (smartSerialize && isRoot && !variables.functions) {
        variables.functions = {};
    }

    if (!smartSerialize && !blockWarning) {
        console.warn("Serializing functions to JSON. These will be parsed with eval, leading to vulnerabilities. Use smartSerialize to avoid this.")
    }

    var keys = Object.keys(obj);
    var passedFirst = false;
    for (var i = 0; i < Object.keys(obj).length; i++) {
        
        if (keysToIgnore && keysToIgnore.includes(keys[i])) {
            continue;
        }

        var value = obj[keys[i]];
        if (value === undefined || value === null) {
            continue;
        }

        var valString = "";
        if (value instanceof Function) {
            var funcString = value.toString();
            var valLines = funcString.split('\n')
            funcString = "";
            valLines.forEach((line) => {
                funcString += line.trim();
            })

            if (funcString.includes("[native code]")) {
                throw 'Function contains native code: name=' + keys[i] + ' val=' + funcString
            }

            if (smartSerialize) {
                !variables.functions && (variables.functions = {}); 
                var index = Object.values(variables.functions).indexOf(funcString);
                if (index != -1) {
                    index = Object.keys(variables.functions)[index];
                    valString = '"' + index + '"';
                } else {
                    index = getNextIndex(variables);
                    variables.functions['$' + index] = funcString;
                    valString = '"$' + index + '"';
                }
            } else {
                valString = '"' + funcString.split('"').join('\\"') + '"';
            }

        } else if (typeof value === 'string') {
            valString = "\"" + value + "\"";
        } else if (value instanceof Array) {

            valString = deepSerialize(value, [], smartSerialize, false, variables, true);

        } else if (value instanceof Object)  {

            if (smartSerialize && !keys[i].includes("$") && !keys[i].includes("&")) {
                for (var j = 0; j < IMMUTABLE_TYPES.length; j++) {
                    var type = IMMUTABLE_TYPES[j][0];
                    if (value instanceof type) {

                        var  match = Object.values(variables).find((variable) => {
                            return variable.equals && variable.equals(value);
                        })

                        if (match) {
                            var index =  Object.keys(variables)[Object.values(variables).indexOf(match)].replace("$", "&");
                            valString = "\"" + index + "\"";
                        } else {
                            var index = getNextIndex(variables);
                            variables["$" + index] = value;
                            valString = "\"&" + index + "\"";
                        }

                    }
                }
            }

            if (valString === "") {
                if (value.toJSON === undefined) {

                    //Skip objects that aren't direct decendents of Object
                    if (value.__proto__ && value.__proto__.__proto__) {
                        continue;
                    }
                    valString = deepSerialize(value, [], smartSerialize, false, variables, true);
                } else {
                    valString = value.toJSON(smartSerialize, false, variables, true);
                }
            }
        } else if (typeof value == 'number' || typeof value === 'boolean') {
            valString = value.toString();
        } else  {
            valString = value.toString();

            if (!valString.startsWith("[") && !valString.startsWith("{")) {
                valString = "\"" + valString + "\"";
            }

        }

        if (passedFirst) {
            string += ",";
        }

        if (obj instanceof Array) {
            string += valString;
        } else if (obj instanceof Object) {
            var jsonKey = keys[i].startsWith("_") ? keys[i].slice(1) : keys[i];
            string += "\"" + jsonKey + "\":" + valString;
        } 

        passedFirst = true;
    }

    var functions = "";
    if (smartSerialize && isRoot) {

        if(Object.keys(variables.functions).length > 0) {
            functions = 'var functions = {'
            var first = true;
            Object.keys(variables.functions).forEach((key) => {
                if (!first) {
                    functions += ","
                }

                functions += key + ": " + variables.functions[key];

                first = false;
            })
            functions += '};';
        }

        deepSerialize(variables, [], true, false, variables, true); //Run this once before to recursively compress variables before serialization
        delete variables.functions;
        string += ",\"variables\": " + deepSerialize(variables, [], true, false, variables, true);
    }

    if (obj instanceof Array) {
        string = "[" + string +  "]";
    } else if (obj instanceof Object) {
        string = "{" + string + "}";
    }

    if (smartSerialize && isRoot) {
        return {
            json: string,
            functions: functions
        }
    }

    return string;
}

function getPropertyDescriptor(obj, prop) {
    var desc;
    do {
        desc = Object.getOwnPropertyDescriptor(obj, prop);
    } while (!desc && (obj = Object.getPrototypeOf(obj)));
    return desc;
}


export function setProperties(obj, properties, toIgnore=[]) {
    var keys = Object.keys(properties);
    for (var i = 0; i < keys.length; i++) {

        if (keys[i] === "variables" || toIgnore.includes(keys[i])) {
            continue;
        }
        
        var currObj = properties[keys[i]];

        if (currObj === undefined || currObj === null) {
            continue;
        }

        if (currObj instanceof Function) {
            const func = currObj.toString();
            currObj = currObj.bind(obj);
            currObj.toString = function() {
                return func;
            }
        } else if (Object.keys(currObj).length == 2 && currObj.x !== undefined && currObj.y !== undefined) {
            currObj = Point.from(currObj);
        }

        var descriptor = getPropertyDescriptor(obj, keys[i]);
        if (descriptor && descriptor.get &&!descriptor.set) {
            obj["_" + keys[i]] = currObj;
            continue;
        }

        obj[keys[i]] = currObj;
    }
}

export function deserializeVariables(obj, functions={}) {
    obj = (typeof obj) == 'string' ? JSON.parse(obj) : obj;

    var variableTypes = {};
    var variables = {};//Variables

    obj.variables = Object.assign(obj.variables, functions);
    
    if (obj.variables) {

        Object.keys(obj.variables).forEach((variableName) => {

            if (typeof obj.variables[variableName] === 'string' && obj.variables[variableName].startsWith('function')) {
                console.warn("Loading function '" + variableName + "' from String using eval. this will lead to vulnerabilities. Use smartSerialize to avoid this.")
                var func;
                try {
                    func = eval('(function(){' + obj.variables[variableName] + '})()');
                } catch(e) {
                    throw 'Error creating function from JSON name=' + obj.variables[variableName] + ' val=' + obj.variables[variableName];
                }

                variableTypes[variableName] = {
                    type: Function,
                    value: func
                }
            }

            if (obj.variables[variableName] instanceof Function) {
                var func = functions[variableName];

                if (!func) {
                    throw 'Could not find function: ';
                }

                variableTypes[variableName] = {
                    type: Function,
                    value: func
                }
            }

            IMMUTABLE_TYPES.forEach((typeData) => {

                var typeStructures = typeData.slice(1);


                var typeMatch = false;
                for (var i = 0; i < typeStructures.length; i++) {
                    var toMatch = typeStructures[i];

                    var matchedAll = true;
                    toMatch.forEach((typeVar) => {

                        if (typeVar instanceof Object) {
                            Object.keys(typeVar).forEach((key) => {
                                if (!Object.keys(obj.variables[variableName]).includes(key) || obj.variables[variableName][key] !== typeVar[key]){
                                    matchedAll = false;
                                    return;
                                }
                            })
                            return;
                        }
                        if (!Object.keys(obj.variables[variableName]).includes(typeVar)) {
                            matchedAll = false;
                        }
                    })

                    typeMatch = matchedAll;

                    if (typeMatch) {
                        break;
                    }
                }
                

                if (typeMatch) {
                    variableTypes[variableName] = {
                        type: typeData[0],
                        value: obj.variables[variableName]
                    }
                    return;
                } 

                
            })


            
        })

        Object.keys(obj.variables).forEach((key) => {
            if (key === 'variables' || key === 'functions') {
                return;
            }
            loadVariable(key, variables, variableTypes);
        });

        delete obj['variables'];

    }

    return {
        variables: variables,
        templates: variableTypes
    };
}

function loadVariable(name, variables, templates={}) {

    if (variables[name]) {
        return variables[name];
    }

    var template = templates[name];
    if (!template) {
        console.log("Error unknown variable: name=" + name, templates);
        return null;
    }

    //console.log("oldval=", Object.assign({}, type.value));
    replaceVariables(template.value, {
        variables: variables,
        templates: templates
    });
    
    
    //console.log(dependentVariables);            
    if (template.type === Function) {
        variables[name] = template.value;
    } else {
        variables[name] = template.type.fromJSON(template.value);
    }
    return variables[name];
}

export function replaceVariables(obj, deserializedVariables) {
    var variables = deserializedVariables.variables;
    var templates = deserializedVariables.templates;
    templates = Object.keys(templates).length == 0 ? {} : templates;

    Object.keys(obj).forEach((key) => {

        if (obj[key] instanceof Object || obj[key] instanceof Array) {
            replaceVariables(obj[key], {variables: variables, templates: templates});
            return;
        }

        if ((typeof obj[key]) === 'string') {

            if (obj[key].startsWith("$") || obj[key].startsWith("&")) {
                obj[key] = loadVariable(obj[key].replace("&", "$"), variables, templates);
            }

        } else {

        }

    })
}

export function loadFunctions(params, paramName) {

    if (!params) {
        return;
    }

    var param = paramName !== undefined ? params[paramName] : params;

    if (!param) {
        return;
    }

    if (typeof param === 'string' && param.startsWith('function')) {
        console.warn("Loading function '" + paramName + "' from String using eval. this will lead to vulnerabilities. Use smartSerialize to avoid this.")
        var func;
        try {
            func = eval('(function(){return ' + param + ';})()');
        } catch(e) {
            throw 'Error creating function from String name=' + paramName + ' val=' + param + "\n" + e;
        }

        params[paramName] = func;
    } else if (typeof param === 'object') {
        Object.keys(param).forEach((key) => {
            loadFunctions(param, key);
        })
    }
}