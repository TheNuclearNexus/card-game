import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ViewStyle, Modal } from "react-native";
import { Row } from "../framework/interfaces/Battle";
import Card, { cardDatabase } from "../framework/interfaces/Card";
import { Client } from "../framework/objects/Client";
import { setGlobalScene } from "../framework/objects/SceneManager";
import { url } from "../util/global_data";

const styles = StyleSheet.create({
    cardHolder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        flexWrap: 'wrap',
        backgroundColor: '#747d8c',
        borderRadius: 16
    },
    header: {
        color: 'white',
        fontSize: 28,
        fontWeight: '500',
        width: '100%',
        textAlign: 'center',
    }
})

function HR({ style }: { style?: ViewStyle }) {
    return <View style={[{ width: '100%', paddingHorizontal: 16, marginBottom: 16 }, style]}><View style={{ backgroundColor: 'white', height: 2, borderRadius: 4 }} /></View>
}

function DeckCard({ card, type, player }: { card: Card | undefined, type: 'inactive' | 'active', player: PlayerData }) {
    const [showInfo, setShowInfo] = useState<boolean>(false)
    const [showRowSelect, setShowRowSelect] = useState<boolean>(false)
    // console.log(card)
    if (!card) return <View style={{ width: 80, height: 100, margin: 10 }}>
        <View style={{ borderColor: '#ffa502', borderWidth: 4, width: 25, height: 25, transform: [{ rotate: '45deg' }] }} />
    </View>

    const infoModal = <Modal visible={showInfo}>
        <View style={{ flex: 1, backgroundColor: '#2f3542', paddingHorizontal: 16, paddingVertical: 32, borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: '500' }}>{card.name}</Text>
            <Text style={{ color: '#a4b0be', fontSize: 24, fontWeight: '500' }}>{card.description}</Text>
            <Image style={{ width: 80, height: 100, borderColor: 'white', borderWidth: 4, borderRadius: 8, marginVertical: 16 }} source={{ uri: url + '/images?name=' + card.name }} />
            <HR />
            <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-evenly'}}>
                {card.type === 2 && <Text style={{ color: '#ffa502', fontSize: 24, fontWeight: '500' }}>HP: {card.HP}</Text>}
                <Text style={{ color: '#ffa502', fontSize: 24, fontWeight: '500' }}>AP: {card.type === 2 ? '+' : ''}{card.AP}</Text>
                <Text style={{ color: '#ffa502', fontSize: 24, fontWeight: '500' }}>DP: {card.type === 2 ? '+' : ''}{card.DP}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowInfo(false)} style={{backgroundColor: '#ff4757', borderRadius: 8, padding: 8, marginTop: 16}}><Text style={{color: 'white', fontSize: 24}}>Back</Text></TouchableOpacity>
        </View>
    </Modal>

    function ColButton({slot}: {slot: 0|1|2|3}) {
        return <TouchableOpacity onPress={() => {
            if(!card) return
            player.inventory.splice(player.inventory.indexOf(card), 1)
            const old = player.row1[slot]
            player.row1[slot] = card
            if(old) {
                player.inventory.push(old)
            }
            postPlayerData(player)
            setShowRowSelect(false)
        }}
        style={{ backgroundColor: '#ff4757', borderRadius: 8, padding: 8, marginVertical: 16, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 24 }}>{slot + 1}</Text>
        </TouchableOpacity>
    }

    const colSelectModal = <Modal visible={showRowSelect}>
        <View style={{ flex: 1, backgroundColor: '#2f3542', paddingHorizontal: 16, paddingVertical: 32, borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: '500' }}>Select Row</Text>
            <HR />
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' }}>
                <ColButton slot={0}/>
                <ColButton slot={1}/>
                <ColButton slot={2}/>
                <ColButton slot={3}/>
            </View>                

        </View>
    </Modal>

    if (card.type === 1) {
        // console.log('render')
        return (
            <TouchableOpacity onLongPress={() => {
                setShowInfo(true)
            }} onPress={()=>{
                setShowRowSelect(true)
            }} style={{ width: 80, height: 100, margin: 10, borderColor: '#ff4757', borderWidth: 4, borderRadius: 8 }}>
                <Image source={{ uri: url + '/images?name=' + card.name }} style={{ width: '100%', height: '100%' }} />
                {infoModal}
                {colSelectModal}
            </TouchableOpacity>
        )
    }
    else if (card.type === 2) {
        // console.log('render')
        return (
            <TouchableOpacity onLongPress={() => {
                setShowInfo(true)
            }} onPress={() => {
                if(type === 'active') {
                    player.deck.splice(player.deck.indexOf(card), 1)
                    player.inventory.push(card)
                    postPlayerData(player)
                }
                else if(type === 'inactive') {
                    player.inventory.splice(player.inventory.indexOf(card), 1)
                    player.deck.push(card)
                    postPlayerData(player)
                }
            }} style={{ width: 80, height: 100, margin: 10, borderColor: '#ff4757', borderWidth: 4, borderRadius: 8 }}>
                <Image source={{ uri: url + '/images?name=' + card.name }} style={{ width: '100%', height: '100%' }} />
                {infoModal}
            </TouchableOpacity>
        )
    }

    return <View style={{ width: 80, height: 100, margin: 10 }} />
}

interface PlayerData {
    inventory: Card[],
    row1: Row,
    deck: Card[]
}

let setPlayerData: Dispatch<SetStateAction<PlayerData | undefined>>
async function getPlayerData() {
    const resp = await Client.GET(`player?id=${Client.id}`)
    const p = resp.data

    setPlayerData(p)
}
async function postPlayerData(player: PlayerData) {
    const serialzied = {
        deck: player.deck.map(c => c.name),
        inventory: player.inventory.map(c => c.name),
        row1: {
            0: player.row1[0]?.name,
            1: player.row1[1]?.name,
            2: player.row1[2]?.name,
            3: player.row1[3]?.name,
        }
    }
    // console.log(serialzied)
    const resp = await Client.POST(`player?id=${Client.id}`, serialzied)

    if(resp.status === 200)
        setPlayerData(resp.data)
}

export function Deck() {
    const [playerData, _setPlayerData] = useState<PlayerData>()
    setPlayerData = _setPlayerData


    useEffect(() => {
        getPlayerData()
    }, [])

    if (!playerData) return <View></View>
    // console.log(playerData.deck)

    return <ScrollView style={{ backgroundColor: '#2f3542', height: '100%', width: '100%', flexDirection: 'column', overflow: 'scroll', padding: 8, paddingBottom: 64 }}>
        <TouchableOpacity style={{
            backgroundColor: '#ff4757', height: 32, width: 32, marginLeft: 16, marginTop: 16, borderRadius: 8,
            justifyContent: 'center', alignItems: 'center'
        }} onPress={() => {
            setGlobalScene('overworld')
        }}>
            <Text style={{ color: 'white', fontSize: 28 }}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Active Attackers</Text>
        <HR style={{ paddingHorizontal: 32 }} />

        <View style={styles.cardHolder}>
            <DeckCard card={playerData.row1[0]} type='active' player={playerData}/>
            <DeckCard card={playerData.row1[1]} type='active' player={playerData}/>
            <DeckCard card={playerData.row1[2]} type='active' player={playerData}/>
            <DeckCard card={playerData.row1[3]} type='active' player={playerData}/>
        </View>
        <Text style={styles.header}>Inactive Attackers</Text>
        <HR style={{ paddingHorizontal: 32 }} />
        <View style={styles.cardHolder}>
            {playerData.inventory.filter(c => c.type === 1).sort((a, b) => (a.name >= b.name) ? 1 : -1).map((c, i) => <DeckCard key={i} card={c} type='inactive' player={playerData}/>)}
        </View>
        <HR style={{ marginTop: 16, paddingHorizontal: 4 }} />
        <Text style={styles.header}>Deck</Text>
        <HR style={{ paddingHorizontal: 32 }} />
        <View style={styles.cardHolder}>
            {playerData.deck.sort((a, b) => (a.name >= b.name) ? 1 : -1).map((c, i) => <DeckCard key={i} card={c} type='active' player={playerData}/>)}
        </View>
        <Text style={styles.header}>Inventory</Text>
        <HR style={{ paddingHorizontal: 32 }} />
        <View style={styles.cardHolder}>
            {playerData.inventory.filter(c => c.type === 2).sort((a, b) => (a.name >= b.name) ? 1 : -1).map((c, i) => <DeckCard key={i} card={c} type='inactive' player={playerData}/>)}
        </View>
        <View style={{ height: 64 }} />
    </ScrollView>
}