

import  {Map as MapBase, List as ListBase} from "extendable-immutable"

export class Map extends MapBase {

    constructor(params : {any}, vaar : boolean) {
        super(params, vaar);
    }

    get(paramName : string) {
        return super.get(paramName);
    }

}

export class List extends ListBase {


}