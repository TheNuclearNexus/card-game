/*
Combat flow chart:

function Attack(card, player) { //Attack function for a single row 1 card

if(opponentBoard(card.column(), row 1) == null) //if there is no row 1 card opposing this one
    opponentHP -= card.AP                   //reduce opponent's HP by this attacking card's AP
    return;

if(opponentBoard(card.column(), row 2) == null) //if there is no row 2 card behind the blocking row 1 card
    opponentHP -= (card.AP - opponentBoard(card.column(), 1).DP) //the opponent takes damage equal to 
                                                                 //card's AP minus the defending card's DP
 if(opponentBoard(card.column(), 2) != null)     //if there is a row 2 card behind the blocking row 1 card
    opponentBoard(card.column(), 2).HP -= (card.AP - opponentBoard(card.column(), 1).DP) //the row 2 card
                                                                                         //takes damage

card.ability() //calls a short method that does the effect of a card's ability
status() //check if any player's HP or row 2 card's HP has fallen below 0 and responds accordingly

}

process should be repeated for all 4 cards for that player?

*/
import React from "react"
import { StyleSheet, View, Text } from "react-native";
import Card from "../framework/components/Card";
import { getHeight, getWidth } from "../util/screen";

const styles = StyleSheet.create({
    fullscreen: {
        width: getWidth(), 
        height: getHeight(),
    },
    container: {
        justifyContent: 'center', 
        padding: 3, 
        alignItems: 'center', 
        backgroundColor: '#2f3542',
        width: '100%',
        height: '100%',
    },
    row: {
        width: '100%',
        height: 120,
        marginBottom: 2,
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
});


//hi
export default function Combat() {
    return (
        <View style={[styles.container, styles.fullscreen]}>
            <View style={{height:32, width:'100%', marginTop:46, flexDirection: 'row'}}>
                <View style={{backgroundColor: '#ff4757', height: '100%', width: '50%', paddingLeft: 32, justifyContent: 'center'}}>
                    <Text style={{color: 'white'}}>20</Text> 
                </View>
                <View style={{backgroundColor: '#1e90ff', height: '100%', width: '50%', justifyContent: 'center', paddingRight: 32, alignItems:'flex-end'}}>
                    <Text style={{color: 'white'}}>20</Text> 
                </View>
            </View>
            <View style={[styles.container]}>
                <View style={[styles.row, { backgroundColor: "#747d8c" }]}> 
                    <Card/>
                    <Card/>
                    <Card/>
                    <Card/>
                </View>
                <View style={[styles.row, { backgroundColor: "#a4b0be", borderColor: '#1e90ff', borderBottomWidth: 4 }]} />
                <View style={{ height: 5 }} />
                <View style={[styles.row, { backgroundColor: "#a4b0be", borderColor: '#ff4757', borderTopWidth: 4 }]} />
                <View style={[styles.row, { backgroundColor: "#747d8c" }]} />
            </View>
            <View style={{backgroundColor:'red', height:20}}>
                
            </View>
        </View>
    )
}



