import { AppDatabase } from "./example-db.js";

const DOMP = new DOMParser();

const CARD_TEMPLATE = DOMP.parseFromString(
    await (fetch('./templates/card.html').then( async (res) => {
        return await res.text();
    })),
    'text/html'
);

export class Card {
    id;
    title
    d_id;

    constructor(obj) {
        if(obj) {
            this.id = obj?.id
            this.title = obj?.title;
            this.d_id = obj?.d_id;
        }
    }

    createCard() {
        const card = CARD_TEMPLATE.querySelector('#card-template').cloneNode(true).content;
        card.querySelector('[slot="title"]').innerText = this.title;
        return card;
    }
}

export class Desc {
    id;
    text;
    c_id;

    constructor(text) {
        this.text = text;
    }
}

const cardContainer = document.createElement('div');
    cardContainer.id = 'card-box';

const addBtn = document.getElementById('add-card-btn');
const delBtn = document.getElementById('del-card-btn');

addBtn.onclick = (ev) => {
    DB.setCards( new Card('New Card') );
}

const DB = new AppDatabase();

/**
 * @param {Map<string, Card>} cards 
 */
function loadCardsIntoDOM( cards ) {
    // for(let [key, val] of ) {
    //     console.log(key, val);
    //     cardContainer.append(card.createCard());
    // }
}

loadCardsIntoDOM(await DB.cards);

document.getElementById('app').append( cardContainer );