import React from "react"
import { StyleSheet, View } from "react-native";
import { getHeight, getWidth } from "../util/screen";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 8,
      backgroundColor: "red"
    },
    rect: {
        width: '100%',
        height: '10%'
    }
});


 //hi
 export default function Combat() {
    return (
        <View style={{justifyContent: 'center', alignItems: 'center', width: getWidth(), height: getHeight()}}>
            <View style = {[styles.rect, {backgroundColor: "blue"}]} />
        </View>        
    )
}