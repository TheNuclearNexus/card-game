export default interface Card {
    name: string;           // Name of the card; should be unique for each card
    image: string;          // art of the card
    type: number;           // Type of the card; row 1 or row 2. Row 1 cards are attackers/defenders, while Row 2 cards are strictly booster
    description: string;    // Short description on the card, stating abilities
    HP: number;             // Health points, if a row 2 card
    AP: number;             // Attack points, if a row 1 card
    DP: number;             // Defense points, if a row 1 card
}