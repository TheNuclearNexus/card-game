import { LocationHeadingObject } from "expo-location";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, ClipPath, G, Ellipse, Rect, Polygon } from "react-native-svg";
import { combatRange, pixelsInMeter } from "../../util/global_data";
import { getCenter } from "../../util/screen";
import { toRadians } from "../../util/trig";
import Circle from "../components/Circle";
import { BaseObject } from "./BaseObject";
import { Client } from "./Client";

const maxDiameter = combatRange * pixelsInMeter
let curDiameter = 30

const styles = StyleSheet.create({
    headingBox: {
        width: 90, height: 90,
        justifyContent: 'flex-end',
        top: -45,
        left: -45,
        alignItems: 'center',
        marginBottom: -90,
    },
    headingTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 22,
        borderBottomWidth: 45,
        borderLeftWidth: 22,
        opacity: 0.5,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#ff6b81',
        borderLeftColor: 'transparent'
    }
});

function HeadingTriangle(props: any) {
    return (<Svg height="45" width="45">
        <Defs>
            <RadialGradient
                id="grad"
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="00%"
                gradientUnits="userSpaceOnUse"
            >
                <Stop offset="0%" stopColor="#ff6b81" stopOpacity="0.5" />
                <Stop offset="75%" stopColor="#fff" stopOpacity="0" />
            </RadialGradient>
            <ClipPath id="clip">
                <G scale="1" x="0">
                    <Polygon points="22.5,0 45,45 0,45" />
                </G>
            </ClipPath>
        </Defs>
        <Rect
            x="0"
            y="0"
            width="90"
            height="90"
            fill="url(#grad)"
            clipPath="url(#clip)"
        />
    </Svg>)
}

export default function Player(props: any) {
    const [diameter, setDiameter] = useState(curDiameter)
    const [heading, setHeading] = useState(0)
    function onTick() {
        curDiameter = (curDiameter + 2) % maxDiameter;
        setDiameter(curDiameter)
    }
    function onHeading(heading: LocationHeadingObject) {
        setHeading(heading.magHeading)
    }

    useEffect(() => {
        const heading = Client.on('heading-update', onHeading)
        const tick = Client.on('tick', onTick)
        
        return () => {
            Client.removeListener('tick', tick)
            Client.removeListener('heading-update', heading)
        }
    }, [])

    return (<View style={{ left: props.pos.x, top: props.pos.y }}>
        <Circle key="radarRange" diameter={maxDiameter} borderWidth={2} borderColor={`rgba(	164, 176, 190,1)`} />
        <Circle key="radar" diameter={diameter} borderWidth={2} borderColor={`rgba(	164, 176, 190,${(maxDiameter - diameter) / maxDiameter / 2})`} />
        <View style={[styles.headingBox, { transform: [{ rotate: `180deg` }] }]}>
            <HeadingTriangle/>
        </View>
        <Circle key="playerIcon" diameter={14} color='#ff4757' borderColor='#ffffff' borderWidth={2} />
    </View>)
}
