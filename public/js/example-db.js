import { 
    IDB_select_ALLIN as SELECT_ALL, 
    IDB_connect as OPEN_DB, 
    IDB_update as UPDATE,
    IDB_add as ADD
} from "../../src/idb-redoc.js";

export class Card {
    id;
    title
    d_id;

    constructor(title) {
        this.title = title;
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

export class AppDatabase {

    /**
     * @typedef {{
     *  id: number,
     *  title: string, 
     *  d_id: number, 
     * }} card
     *
     * @typedef {{
     *  id: number,
     *  text: string, 
     *  c_id: number, 
     * }} desc
     */

    #db_instance;
    #version = 1; //!Hard reset if tables change
    #name = 'simple-data';
    
    /**@type {DB_STORES} */
    #tables = new Map([
        ['cards', {
            name: 'cards',
            primary: 'id',
            autoIncrement: true,
            indexes: ['title', 'd_id']
        }],
        ['descs', {
            name: 'descs',
            primary: 'id',
            autoIncrement: true,
            indexes: ['text', 'c_id']
        }]
    ]);

    /**@type {Map<string, Card>} */
    #cardRepo;
    /**@type {Map<string, Desc>} */
    #descRepo;

    constructor() {

        this.#db_instance = OPEN_DB( this.#name, this.#version, this.#tables ).then( db => {return db;} );

        this.#db_instance.then( (DB) => {
            this.#cardRepo = SELECT_ALL(DB, this.#tables.get('cards')).then( 
                (/**@type {Array<card>}*/ arr) => {
                    console.log(arr);
                    let cardRepoArray = new Map();
                    arr.map( (card) => {
                        const newCard = new Card(card.title);
                        newCard.id = card.id;
                        newCard.d_id = card.d_id;
                        cardRepoArray.set(newCard.id, newCard);
                    })
                }
            );
            this.#descRepo = SELECT_ALL(DB, this.#tables.get('descs'));
        });
    }

    /**
     * @returns {Promis<card[]>}
     */
    get cards() {
        console.log('calling example cards...');

        return this.#db_instance.then( (DB) => {
            return SELECT_ALL(DB, this.#tables.get('cards'));
        });
    }

    /**
     * @returns {Promis<desc[]>}
     */
    get descriptions() {

        return this.#db_instance.then( (DB) => {
            return SELECT_ALL(DB, this.#tables.get('descs'));
        });
    }

    getCard( id ) {
        return this.#cardRepo.get(id);
    }

    /**
     * @param  {...card} cards
     * @returns {}
     */
    setCards( ...cards ) {
        //TODO check if card is in CardsRepo, if not use add; and add id and dID

        const promises = new Array();
        for(let card of cards) {
            if(card.id) {
                promises.push(
                    this.#db_instance.then( (DB) => {
                        UPDATE(DB, this.#tables.get('cards'), {value: card, key: card.id})
                    })
                );
            } else {
                promises.push(
                    this.#db_instance.then( (DB) => {
                        ADD(DB, this.#tables.get('cards'), {value: {title: card.title}})
                    })
                );
            }
        }
        return Promise.all(promises);
    }
}

