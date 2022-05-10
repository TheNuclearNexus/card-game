import Card from "./Card"

export interface Row {
    0?: Card,
    1?: Card,
    2?: Card,
    3?: Card
}

export interface BattlePlayer {
    row1: Row
    row2: Row
    lives: number,
    hp: number,
    id: string,
    deck: string[],
    hand: string[]
}

export interface Battle{
    playerA: BattlePlayer,
    playerB: BattlePlayer,
    turn: {
        number: number,
        startTime: number,
        endTime: number
    }
}