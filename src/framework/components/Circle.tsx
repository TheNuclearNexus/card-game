import React from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import { Client } from "../objects/Client";

interface CircleProps extends ViewProps {
    diameter: number,
    color?: string,
    borderColor?: string,
    borderWidth?: number
}

export default function Circle(props: CircleProps) {
    const style: StyleProp<ViewStyle> = {
        width: props.diameter,
        height: props.diameter,
        borderRadius: props.diameter / 2,
        backgroundColor: props.color,
        borderWidth: props.borderWidth,
        position: 'absolute',
        left: -props.diameter / 2,
        top: -props.diameter / 2,
        borderColor: props.borderColor
    }
    return (
        <View>
            <View style={[style, props.style]}
                {...props}
            />
        </View>
    )
}