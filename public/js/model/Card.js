import { AppDB } from "../example-db";

export class Card {
    id;
    title
    d_id;

    constructor(title = 'Card Title') {
        this.title = title;
    }

    loadCard( template ) {
        const card = template.querySelector('#card-template').cloneNode(true).content;
        card.querySelector('[slot="title"]').innerText = this.title;
        return card;
    }
}