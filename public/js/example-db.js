import { Card, Desc } from "./main.js";
import { 
    IDB_select_ALLIN as SELECT_ALL, 
    IDB_connect as OPEN_DB, 
    IDB_update as UPDATE,
    IDB_add as ADD
} from "../../src/idb-redoc.js";


// export class AppDatabase {
class AppDatabase {

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

    constructor() { //! unable to await DB so use await/then outside of constructor
        // this.#db_instance = OPEN_DB( this.#name, this.#version, this.#tables ).then( db => {return db;} );

        // this.fetchCards();
    }

    static async create() {
        
    }

    /**@returns {Promise<Map<string, Card>>} */
    get cards() {
        console.log('get cards: ', this.#cardRepo);
        return new Promise( (res) => res(this.#cardRepo) );
    }

    /**@returns {Map<string, Card>} */
    get descriptions() {

        return this.#db_instance.then( (DB) => {
            return SELECT_ALL(DB, this.#tables.get('descs')).then( (arr) => {
                arr.map( obj => {
                    return Object.assign(new Desc(), obj);
                } )
            });
        });
    }

    getCard( id ) {
        return this.#cardRepo.get(id);
    }

    async fetchCards() {
        console.log('IDB CardRepo');
        this.#cardRepo = new Map();
        const DB = await this.#db_instance;

        const cardArr = (await SELECT_ALL(DB, this.#tables.get('cards')));
        cardArr.map( (card) => {
            this.#cardRepo.set( card.id, Object.assign(new Card(), card) );
        } );

        return this.#cardRepo;
    }

    /**
     * @param  {...card} cards
     * @returns {}
     */
    async setCards( ...cards ) {
        //TODO check if card is in CardsRepo, if not use add; and add id and dID

        const promises = new Array();
        for(let card of cards) {
            if(card.id) {
                promises.push(
                    this.#db_instance.then( (DB) => {
                        UPDATE(DB, this.#tables.get('cards'), {value: card, key: card.id})
                        .then( (id) => {
                            this.#cardRepo.set(card.id, card);
                        });
                    })
                );
            } else {
                promises.push(
                    this.#db_instance.then( (DB) => {
                        ADD(DB, this.#tables.get('cards'), {value: {title: card.title}})
                        .then( (id) => {
                            card.id = id;
                            this.#cardRepo.set(card.id, card);
                        });
                    })
                );
            }
        }
        return await Promise.all(promises);
    }
}

