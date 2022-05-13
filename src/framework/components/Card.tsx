import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text, Modal, Image } from "react-native";
import { url } from "../../util/global_data";
import { getCenter } from "../../util/screen";
import Card, { cardDatabase } from '../interfaces/Card'
import { Client } from "../objects/Client";
import SFX from "../objects/SFX";
const styles = StyleSheet.create({
    cardShape: {
        justifyContent: 'space-evenly',
        width: 80,
        height: 100,
        margin: 10
    }
});


function colorFromCompare(a: number, b: number) {
    if (a > b) return '#2ed573'
    if (a < b) return '#ff4757'
    return '#ffa502'
}

export let row1Cards: ((selectable: boolean) => void)[] = []
export let row2Cards: ((selectable: boolean) => void)[] = []
let cardToPlay: number = -1
let resetFunc: () => void
export function setCardToPlay(idx: number, reset: () => void) { cardToPlay = idx; resetFunc = reset }

function EmptyCard(props: { mine: boolean, type: number, [key: string]: any }) {
    const [selectable, setSelectable] = useState<boolean>()
    useEffect(() => {
        if (!props.mine) return

        if (props.type === 1) row1Cards.push(setSelectable)
        if (props.type === 2) row2Cards.push(setSelectable)

        return () => {
            if (props.type === 1) row1Cards = row1Cards.filter(s => s !== setSelectable)
            if (props.type === 2) row2Cards = row2Cards.filter(s => s !== setSelectable)
        }

    })
    return <View style={[styles.cardShape, { alignItems: 'center' }]} {...props} onTouchStart={async () => {
        if (cardToPlay === -1) return

        await Client.POST(`battle?id=play-card&me=${Client.id}&from=${cardToPlay}&to=${props.idx}`)
        SFX.play('play-card')
        resetFunc()

    }}>
        <View style={{ borderColor: props.mine ? (selectable ? '#ffa502' : '#ff4757') : '#1e90ff', borderWidth: 4, width: 25, height: 25, transform: [{ rotate: '45deg' }] }}></View>
    </View>
}

export default function CardComponent(props: { idx: number, card?: Card, row2Card?: Card, mine: boolean, type: number }) {
    const [showInfo, setShowInfo] = useState<boolean>(false)
    const card = props.card
    if (!card) return <EmptyCard idx={props.idx} mine={props.mine} type={props.type} />

    if (props.row2Card) {
        card.AP += props.row2Card.AP
        card.DP += props.row2Card.DP
    }

    const dbCard = cardDatabase.find(c => c.name === card.name);
    if (!dbCard) return <EmptyCard idx={props.idx} mine={props.mine} type={props.type} />

    const cardStatsModal = <Modal visible={showInfo} transparent={true}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', top: getCenter().y * 2 - 280, width: '100%', height: '100%' }}>
            <View style={{ minWidth: '33%', alignSelf: 'flex-start', backgroundColor: '#dfe4ea', borderColor: '#747d8c', borderWidth: 4, borderRadius: 8, justifyContent: 'center', padding: 20 }}>
                <Text style={{ color: props.mine ? '#ff4757' : '#1e90ff', fontSize: 20, fontWeight: 'bold' }}>{card.name.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    {card.type === 2 &&
                        <Text style={{ color: '#ffa502' }}>HP: <Text style={{ color: colorFromCompare(card.HP, dbCard.HP) }}>{card.HP}</Text>/{dbCard.HP}</Text>}
                    <Text style={{ color: '#ffa502' }}>AP: <Text style={{ color: colorFromCompare(card.AP, dbCard.AP) }}>{card.AP}</Text>/{dbCard.AP}</Text>
                    <Text style={{ color: '#ffa502' }}>DP: <Text style={{ color: colorFromCompare(card.DP, dbCard.DP) }}>{card.DP}</Text>/{dbCard.DP}</Text>
                </View>
                {card.description !== '' && <Text>{card.description}</Text>}
            </View>
        </View>
    </Modal>;

    function SmallStat({ cur, max }: { cur: number, max: number }) {
        return <View style={{backgroundColor: '#2f3542', padding: 1, borderRadius: 8}}>
            <Text style={{ color: colorFromCompare(cur, max) }}>{cur}</Text>
        </View>
    }

    return (
        <View onTouchStart={() => setShowInfo(true)} onTouchEnd={() => setShowInfo(false)}>
            <View style={[styles.cardShape, { backgroundColor: "transparent", borderColor: props.mine ? '#ff4757' : '#1e90ff', borderWidth: 4, borderRadius: 8 }]}>
                <Image source={{ uri: url + '/images?name=' + card.name }} style={{ width: '100%', height: '100%', backgroundColor: '#2f3542' }} />
                <View style={{ position: 'absolute', top: 0, flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 4 }}>
                    {card.type === 2 &&
                    <SmallStat cur={card.HP} max={dbCard.HP} />}
                    <SmallStat cur={card.AP} max={dbCard.AP} />
                    <SmallStat cur={card.DP} max={dbCard.DP} />
                </View>
            </View>
            {cardStatsModal}
        </View>
    )
}

