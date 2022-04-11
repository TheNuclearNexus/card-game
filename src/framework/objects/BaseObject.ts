import Coordinate from "../interfaces/Coordinate";


export class BaseObject {
    position = {}
    constructor(position: Coordinate) {
        this.position = position;
        
    }


    public onClick() {
        
    }

    public onLoad() {

    }

    public onTick() {

    }

    public render() {

    }
}