import { AppDatabase, Card } from "./example-db.js";

const DB = new AppDatabase();

console.log(await DB.cards);

// console.log(await DB.setCards(new Card('hello'), new Card('How Are you')));