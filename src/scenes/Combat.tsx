/*
Combat flow chart:

function Attack(card, opposingCard) {       //Attack function for a single row 1 card

if(opposingCard == null)                    //if there is no row 1 card opposing this one
    opponentHP -= card.AP                   //reduce opponent's HP by this attacking card's AP
    return;

if(cardBehind(opposingCard) == null)                         //if there is no row 2 card behind the blocking row 1 card
    opponentHP -= (card.AP - opposingCard.DP)                           //the opponent takes damage equal to 
                                                                        //card's AP minus the defending card's DP
 if(cardBehind(opposingCard) != null)                            //if there is a row 2 card behind the blocking row 1 card
    cardBehind(opposingCard).HP -= (card.AP - opposingCard.DP)   //the row 2 card
                                                                        //takes damage

card.ability()              //calls a short method that does the effect of a card's ability
status(card, opposingCard)  //check if any player's HP or row 2 card's HP has fallen below 0 and responds accordingly

}

process should be repeated for all 4 cards for that player,
then all four for the opposing player

function status(card, opposingCard) {

    if(cardBehind(opposingCard).HP <= 0)    //destroy the row2 card behind opposing card
        cardBehind(opposingCard) = null
        setStats(opposingCard)              //reset the stats of the opposing card(as booster card is now destroyed)
    
    if(player1.HP <= 0) {
        if(player2.HP <= 0)
            gameEnd(condition: 0) //game is drawed (condition 0:draw, condition 1: P1 wins, condition 2: P2 wins)
        gameEnd(condition 2)      //win for player 2
    }
    gameEnd(condition 1)          //win for player 1 

}

*/
import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text } from "react-native";
import Card from "../framework/components/Card";
import Circle from "../framework/components/Circle";
import HandCard from "../framework/components/HandCard";
import { Battle, Row } from "../framework/interfaces/Battle";
import ICard, { cardDatabase } from "../framework/interfaces/Card";
import { Client } from "../framework/objects/Client";
import { setGlobalScene } from "../framework/objects/SceneManager";
import SFX from "../framework/objects/SFX";
import { getCenter, getHeight, getWidth } from "../util/screen";

const styles = StyleSheet.create({
    fullscreen: {
        width: getWidth(),
        height: getHeight(),
        padding: 0,
    },
    container: {
        justifyContent: 'flex-start',
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#2f3542',
        width: '100%',
        height: '100%',
    },
    row: {
        width: '100%',
        height: 120,
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
});


//hi
function rowToCards(row: Row, mine: boolean, type: number, backRow?: Row, reverse?: boolean) {
    return [
        <Card idx={0} key={`${mine}${type}0`} card={row[0]} row2Card={backRow ? backRow[0] : undefined} mine={mine} type={type} />,
        <Card idx={1} key={`${mine}${type}1`} card={row[1]} row2Card={backRow ? backRow[1] : undefined} mine={mine} type={type} />,
        <Card idx={2} key={`${mine}${type}2`} card={row[2]} row2Card={backRow ? backRow[2] : undefined} mine={mine} type={type} />,
        <Card idx={3} key={`${mine}${type}3`} card={row[3]} row2Card={backRow ? backRow[3] : undefined} mine={mine} type={type} />
    ]
}

function handToCards(hand: string[]) {
    return hand.map((card, index) => {
        const dbCard = cardDatabase.find(c => c.name === card);
        if (dbCard)
            return <HandCard key={index} idx={index} card={dbCard} />
    })
}

function TurnTimer({ startTime, endTime }: { startTime: number, endTime: number }) {
    const diff = endTime - startTime;
    const [time, setTime] = useState(0);
    useEffect(() => {
        const tick = Client.on('tick', () => {
            let newTime = (Date.now() - startTime) / 1000;
            newTime = Math.min(newTime * 100 / diff, 100)
            setTime(newTime);
        })
        return () => Client.removeListener('tick', tick)
    }, [startTime, endTime])

    return <View style={{ width: '100%', backgroundColor: '#57606f' }}>
        <View style={{ width: `${time.toFixed(1)}%`, backgroundColor: 'white', height: 3 }}></View>
    </View>
}

export default function Combat() {
    const [battle, setBattle] = useState<Battle | undefined>(undefined)
    const [battleState, setBattleState] = useState<'active' | 'win' | 'loss'>('active')
    useEffect(() => {
        const bU = Client.on('battle-update', (battle: Battle) => {
            Client.log('battle update')
            for(let a of battle.turn.actions) {
                if(a.id === 'draw')
                    SFX.play('play-card')
            }
            // console.log(battle.turn.startTime, battle.turn.endTime)
            setBattle(battle)
        })
        const bE = Client.on('end-battle', async (type: 'win' | 'loss') => {
            SFX.play(type)

            setBattleState(type)
            setTimeout(() => {
                setBattle(undefined)
                setBattleState('active')
                setGlobalScene('overworld')
            }, 4000)
        })
        return () => { Client.removeListener('battle-update', bU); Client.removeListener('end-battle', bE) }
    }, [])

    if (!battle) return <View><Text>Waiting...</Text></View>

    let me = battle.playerA.id === Client.id ? battle.playerA : battle.playerB
    let op = battle.playerA.id === Client.id ? battle.playerB : battle.playerA

    if (battleState === 'win' || battleState === 'loss') return (
        <View style={[styles.container, {justifyContent: 'center'}]}>
            <Text style={{color: 'white', fontSize:48}}>You {battleState === 'win' ? 'WIN!' : 'LOSE :('}</Text>
        </View>
    )


    return (
        <View style={[styles.container, styles.fullscreen]}>
            <View style={{ height: 32, width: '100%', flexDirection: 'row' }}>
                <View style={{ backgroundColor: '#ff4757', height: '100%', width: '50%', paddingLeft: 32, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={{ color: 'white' }}>{me.hp}</Text>
                    <View style={{ marginLeft: 8, flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                        {me.lives === 2 && <View style={{ backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 }} />}
                        {me.lives >= 1 && <View style={{ backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 }} />}
                    </View>
                </View>
                <View style={{ backgroundColor: '#1e90ff', height: '100%', width: '50%', justifyContent: 'flex-end', paddingRight: 32, alignItems: 'center', flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row-reverse', justifyContent: 'flex-start', width: '100%' }}>
                        {op.lives === 2 && <View style={{ backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 }} />}
                        {op.lives >= 1 && <View style={{ backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 }} />}
                    </View>
                    <Text style={{ color: 'white', marginLeft: 8 }}>{op.hp}</Text>
                </View>
            </View>
            <TurnTimer startTime={battle.turn.startTime} endTime={battle.turn.endTime} />
            <View style={{ padding: 4, backgroundColor: '#57606f', borderRadius: 8, marginTop: 4 }}>
                <Text style={{ color: 'white', fontSize: 20 }}>Turn #{battle.turn.number}</Text>
            </View>
            <View style={[styles.container]}>
                <View style={[styles.row, { marginTop: 16, backgroundColor: "#747d8c", borderTopLeftRadius: 8, borderTopRightRadius: 8 }]}>
                    {rowToCards(op.row2, false, 2)}
                </View>
                <View style={[styles.row, { backgroundColor: "#a4b0be", borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderColor: '#1e90ff', borderBottomWidth: 4 }]}>
                    {rowToCards(op.row1, false, 1, op.row2)}
                </View>
                <View style={{ height: 5 }} />
                <View style={[styles.row, { backgroundColor: "#a4b0be", borderTopLeftRadius: 8, borderTopRightRadius: 8, borderColor: '#ff4757', borderTopWidth: 4 }]}>
                    {rowToCards(me.row1, true, 1, me.row2)}
                </View>
                <View style={[styles.row, { backgroundColor: "#747d8c", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }]}>
                    {rowToCards(me.row2, true, 2)}
                </View>
            </View>
            <View style={{ position: 'absolute', top: getCenter().y * 2 - 168, padding: 6 }}>
                <View style={[styles.row, { backgroundColor: "#747d8c", borderRadius: 8, overflow: 'scroll' }]}>
                    {handToCards(me.hand)}
                </View>
            </View>
        </View>
    )
}

