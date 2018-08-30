
import GameObject from '../object/GameObject'
import { setProperties } from "./Serialize"

export default class UI {

    static DEFAULT_PARAMS = {
        'fixedPosition': true,
        components: {
            collider: {

            },
            spriterenderer: {

            },
        }
    }

    static createUIComponent(params : { any }) : GameObject {
        if (!params) {
            return;
        }
        
        params = Object.assign({}, UI.DEFAULT_PARAMS, params);

        return GameObject.create(params);
    }

    static createButton(params) {
        
    }

}
