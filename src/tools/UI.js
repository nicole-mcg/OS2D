
import GameObject from '../object/GameObject.js'
import { setProperties } from "./Serialize.js"

export default class UI {

    static createUIComponent(params) {
        params = Object.assign({}, params);
        
        var components = params.components;
        if (components) {
            setProperties(components, UI.UI_PARAMS.components);
        }

        setProperties(params, UI.UI_PARAMS);
        params.components = components;

        return GameObject.create(params);
    }

    static createButton(params) {
        
    }

    static initialize() {
        UI.UI_PARAMS = {
            'fixedPosition': true,
            components: {
                collider: {

                },
                spriterenderer: {

                },
            }
        }
    }

}
