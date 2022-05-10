import React, { useEffect, useState } from "react";
import { View, Modal, Text, Image, StyleSheet, TouchableHighlight, TouchableOpacity } from "react-native";
import { wait } from "../../util/async";
import { getCenter } from "../../util/screen";
import Card, { cardDatabase } from "../interfaces/Card";
import { url } from "../objects/Client";
import { row1Cards, row2Cards, setCardToPlay } from "./Card";
const styles = StyleSheet.create({
    cardShape: {
        justifyContent: 'space-evenly',
        width: 80,
        height: 100,
        margin: 10
    }
});

let handCards: ((selected: boolean) => void)[] = []

export default function HandCard(props: { card: Card, idx: number }) {
    const [selected, setSelected] = useState<boolean>(false)
    const [showInfo, setShowInfo] = useState<boolean>(false)
    const reset = () => {
        handCards.forEach(s => s(false))

        row1Cards.forEach(s => s(false))
        row2Cards.forEach(s => s(false))
    }

    const selectCard = () => {
        reset()
        setCardToPlay(props.idx, reset)
        setSelected(true)
        if (card.type === 1) row1Cards.forEach(s => s(true))
        if (card.type === 2) row2Cards.forEach(s => s(true))
    }

    useEffect(() => {
        handCards.push(setSelected)

        return () => {
            handCards = handCards.filter(s => s !== setSelected)
        }
    })

    const card = props.card
    const dbCard = cardDatabase.find(c => c.name === card.name);
    if (!dbCard) return <View />

    const cardStatsModal = <Modal visible={showInfo} transparent={true}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', top: getCenter().y * 2 - 280, width: '100%', height: '100%' }}>
            <View style={{ minWidth: '33%', alignSelf: 'flex-start', backgroundColor: '#dfe4ea', borderColor: '#747d8c', borderWidth: 4, borderRadius: 8, justifyContent: 'center', padding: 20 }}>
                <Text style={{ color: '#ff4757', fontSize: 20, fontWeight: 'bold' }}>{card.name.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    {card.type === 2 &&
                        <Text style={{ color: '#ffa502' }}>HP: <Text>{card.HP}</Text>/{dbCard.HP}</Text>}
                    <Text style={{ color: '#ffa502' }}>AP: <Text>{card.AP}</Text>/{dbCard.AP}</Text>
                    <Text style={{ color: '#ffa502' }}>DP: <Text>{card.DP}</Text>/{dbCard.DP}</Text>
                </View>
                {card.description !== '' && <Text>{card.description}</Text>}
            </View>
        </View>
    </Modal>;

    return (
        <View>
            <TouchableOpacity 
                onPressIn={() => setShowInfo(true)}
                onPressOut={() => setShowInfo(false)}
                onPress={(event) => {

                    if (!selected) {
                        // console.log(row1Cards)
                        // console.log(row2Cards)
                        selectCard()
                    } else {
                        console.log('Hand: ', props.idx)
                        reset()
                    }
                }
            }>
                <View style={[styles.cardShape, { backgroundColor: "transparent", borderColor: selected ? '#ffa502' : '#ff4757', borderWidth: 4, borderRadius: 8 }]}>
                    <Image source={{ uri: url + '/images?name=' + card.name }} style={{ width: '100%', height: '100%' }} />
                </View>
            </TouchableOpacity>
            {cardStatsModal}
        </View>

    )
}
