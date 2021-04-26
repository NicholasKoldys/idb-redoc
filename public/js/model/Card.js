import { AppDB } from "../example-db";

export class Card {
    id;
    title
    d_id;

    constructor(title) {
        if(title) {
            this.title = title;
            this.createCard();
        }
    }

    loadCard( template ) {
        const card = template.querySelector('#card-template').cloneNode(true).content;
        card.querySelector('[slot="title"]').innerText = this.title;
        return card;
    }

    async createCard() {
        try {
            this.id = await AppDB.setCards( this );
        } catch( e ) {
            console.log(e);
        }
    }
}