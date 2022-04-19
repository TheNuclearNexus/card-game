import Coordinate from "../interfaces/Coordinate";
import React, { useEffect, useState } from 'react'
import { Dimensions, View } from "react-native";
import { globalScene } from "./SceneManager";

const objectRegister: {[key: string]: BaseObject[]} = {}

let renderFunc = () => {}
export function ObjectRenderer() {
    renderFunc = () => {
        setObjectElement(<View style={{maxWidth: Dimensions.get('window').width, maxHeight: Dimensions.get('window').height, position: 'absolute'}}>
            {objectRegister[globalScene] !== undefined && objectRegister[globalScene].map(obj => <View style={{left: obj.position.x, top: obj.position.y}}>{obj.render()}</View>)}
        </View>)
    }
    const [objectElement, setObjectElement] = useState<JSX.Element>(<View></View>)

    useEffect(() => {
        renderFunc()
    }, [])

    return (objectElement)
}

export class BaseObject {
    position: Coordinate = {x: 0, y: 0}
    constructor(position: Coordinate) {
        this.position = position;

        if(objectRegister[globalScene] === undefined)
            objectRegister[globalScene] = []

        objectRegister[globalScene].push(this)
        renderFunc()
    }


    public onClick() {
        
    }

    public onLoad() {

    }

    public onTick() {

    }

    public shift(x: number, y: number) {
        this.position.x += x;
        this.position.y += y;
        renderFunc()
    }

    public moveTo(x: number, y: number) {
        this.position.x = x;
        this.position.y = y;
        renderFunc()
    }

    public render() {
        useEffect(() => {
            this.onLoad()
        }, [])

        return <View>

        </View>
    }
}