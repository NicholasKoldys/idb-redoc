import { 
    IDB_select_ALLIN as SELECT_ALL, 
    IDB_connect as OPEN_DB, 
    IDB_update as UPDATE,
    IDB_add as ADD
} from "../../src/idb-redoc.js";
import { Card } from "./model/Card.js";

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

    /**@type {Promise<IDBDatabase>|IDBDatabase} */
    #db_instance;
    #version; //!Hard reset if tables change
    #name;
    #isInit;
    
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

    //! unable to await DB so use await/then outside of constructor
    constructor(name, version) {
        this.#name = name || 'simple-data';
        this.version = version || 1;
        this.#db_instance = null;
        this.#isInit = false;
    }

    async init() {
        this.#db_instance = await OPEN_DB( this.#name, this.#version, this.#tables );
        await this.loadCardRepo();
        this.#isInit = true;
        return this;
    }

    async loadCardRepo() {
        console.log('IDB CardRepo');
        this.#cardRepo = new Map();
        const DB = await this.#db_instance;

        const cardArr = (await SELECT_ALL(DB, this.#tables.get('cards')));
        cardArr.map( (card) => {
            this.#cardRepo.set( card.id, Object.assign(new Card(), card) );
        } );

        return this.#cardRepo;
    }

    /** @returns {Promise<Map<string, Card>>} */
    get cards() {
        if(this.#isInit)
        return this.#cardRepo;
    }

    /** @returns {Map<string, Card>} */
    get descriptions() {
        if(this.#isInit) 
        return this.#db_instance.then( (DB) => {
            return SELECT_ALL(DB, this.#tables.get('descs')).then( (arr) => {
                arr.map( obj => {
                    return Object.assign(new Desc(), obj);
                } )
            });
        });
    }

    /** 
     * @param {number} id 
     * @returns {Card} 
     */
    getCard( id ) {
        if(this.#isInit) return this.#cardRepo.get(id);
    }

    /** @param {Card} card */
    async addCard( card ) {
        if(this.#isInit) {
            let DB = await this.#db_instance;
            let cardID = await ADD(DB, this.#tables.get('cards'), {value: {title: card.title}});
            card.id = cardID;
            this.#cardRepo.set(cardID, card);
        }
    }

    /** @param {Card} card */
    async setCard( card ) {
        if(this.#isInit) {
            let DB = await this.#db_instance;
            let cardID = await ADD(DB, this.#tables.get('cards'), {value: {title: card.title}, key: card.id});
            this.#cardRepo.set(cardID, card);
        }
    }

    /**
     * @param {...Card} cards
     * @returns {}
     */
    async setCards( ...cards ) {
        //TODO check if card is in CardsRepo, if not use add; and add id and dID
        if(this.#isInit) {
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
}

export const AppDB = await (
    async function() {
        const DB = new AppDatabase();
        return await DB.init();
    }
)();