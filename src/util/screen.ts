import { Dimensions } from "react-native";
import Coordinate from "../framework/interfaces/Coordinate";

export function getCenter(): Coordinate {
    return {
        x: Dimensions.get('window').width / 2,
        y: Dimensions.get('window').height / 2
    }
}

export function getHeight(): number {
    return Dimensions.get('window').height;
}
export function getWidth(): number {
    return Dimensions.get('window').width;
}