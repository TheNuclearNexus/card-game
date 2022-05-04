import React from "react"
import { StyleSheet, View, Text } from "react-native";
import Card from '../interfaces/Card'
const styles = StyleSheet.create({
    cardShape: {
        justifyContent: 'space-evenly', 
        width: 80,
        height: 100,
        margin: 10
    }
});




export default function CardComponent(props: {card?: Card}) {
    return (
        <View>
            <View style={[styles.cardShape, { backgroundColor: "white", borderColor: '#000000', borderWidth: 4}] }/>
        </View>
    )
}

