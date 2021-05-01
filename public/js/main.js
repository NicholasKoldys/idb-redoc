import { AppDB as DB } from "./example-db.js";
import { Card } from "./model/Card.js";

const DOMP = new DOMParser();

const CARD_TEMPLATE = DOMP.parseFromString(
    await (fetch('./templates/card.html').then( async (res) => {
        return await res.text();
    })),
    'text/html'
);

const cardBox = document.getElementById('card-box');
const addBtn = document.getElementById('add-card-btn');
const delBtn = document.getElementById('del-card-btn');

addBtn.onclick = async (ev) => {
    const card = new Card('New Card');
    try {
        card.id = await DB.addCard( card );
        loadCardsIntoDOM( await DB.cards );
    } catch( e ) {
        console.log(e);
    }
}

/**
 * @param {Map<string, Card>} cards 
 */
function loadCardsIntoDOM( cards ) {
    // for(let [_, card] of cards ) {
    cardBox.innerHTML = '';
    cards.forEach( card => {
        cardBox.append( card.loadCard( CARD_TEMPLATE ) );
    });
}

loadCardsIntoDOM(await DB.cards);