export class Card {
    id;
    title
    d_id;

    constructor(title = 'Card Title') {
        this.title = title;
    }

    loadCard( template ) {
        /**@type {HTMLDivElement}*/
        const card = template.querySelector('#card-template').cloneNode(true).content;
        card.querySelector('[slot="title"]').innerText = this.title;

        card.querySelector('div.card').addEventListener('click', (ev) => {
            let previous = ev.currentTarget.parentElement.querySelector('.selected');
            if(previous) previous.classList.remove('selected');
            ev.currentTarget.classList.add('selected');
        });

        return card;
    }
}