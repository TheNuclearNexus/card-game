import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Circle from "../components/Circle";
import { BaseObject } from "./BaseObject";
import { Client } from "./Client";

const speed = 1000/60
const maxDiameter = 250
let curDiameter = 30

export default function Player(props: any) {
    const [diameter, setDiameter] = useState(curDiameter)

    function onTick() {
        curDiameter = (curDiameter + 1) % maxDiameter; 
        setDiameter(curDiameter)
    }

    useEffect(() => {

        const listener = Client.on('tick', onTick)
        return () => {
            Client.removeListener('tick', listener)
        }
    }, [])

    return (<View style={{left: props.pos.x, top: props.pos.y}}>
        <Circle key="radar" diameter={diameter} borderWidth={2} borderColor={`rgba(255,255,255,${(maxDiameter - diameter)/maxDiameter/2})`}/>
        <Circle key="playerIcon" diameter={14} color='red' borderColor='white' borderWidth={2}/>
    </View>)
}
