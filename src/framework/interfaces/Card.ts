export default interface Card {
    name: string;           // Name of the card; should be unique for each card
    image: string;          // Art of the card(on standby)
    type: number;           // Type of the card; row 1 or row 2
    description: string;    // Any traits the card has
    HP: number;             // Health points, if a row 2 card
    AP: number;             // Attack points, if a row 1 card
    DP: number;             // Defense points, if a row 1 card
}

/*
Format of the cards:

[Row 1 card]:
Known as the "attacking" cards because that's what they do- on a player's turn, all of their Row 1 cards
attack straight ahead with AP damage; the row 1 card opposing those cards will "block" and the damage going
through is lowered by DP amount

[Row 2 card]:
Known as the "booster" cards because they add to the stats of the row 1 card in front of them. This is a
passive effect for all row 2 cards, but will go away if the card is destroyed. The card is destroyed when
its HP drops to 0. Any damage not blocked by a row 1 card will be dealt to this card, but if this card
is destroyed, then any damage is dealt to the defending player

[Traits]:
Some row 1 cards will have a special ability called a "trait" which will activate every time they attack.
A card with a trait will have inheritly lowered stats to ensure balance. Possible traits include:
+Pierce(1 damage is dealt to the defending player every time this card attacks)
+Holy(Attacking player gains 1 HP every time this card attacks)
+Bleed(1 damage is dealt to the row 2 card opposing the attack card, if possible)

*/

export let cardDatabase: Card[] = []
export function setCardDatabase(cards: Card[]) {
    cardDatabase = cards
}