//TODO protect views from reloading constantly....?
//TODO when database updated to cloud... what do i do

/**
 * @typedef {{
* name: string,
* store: { 
*  primary: string, 
*  autoIncrement: boolean, 
*  indexes: Array<string>
* }}} DB_STORE
*/

/**
* @param {string} name 
* @param {long} version 
* @returns {Promise<IDBDatabase>}
*/
function CONNECT(name, version) {

const DB = new Promise( (resolve, reject) => {
  const request = indexedDB.open(name, version);

  request.onsuccess = function (_ev) {
    const DB = this.result;

    DB.onversionchange = function() {
      DB.close()
      // TODO launchPopup($newVersionPopupContent)
    }

    resolve(DB);
  };

  request.onerror = function (ev) {
    console.error("openDb:", ev.target.error);
    reject(ev.target.error);
  };

  request.onupgradeneeded = function (_ev) {
    CREATE( this.result, DB_STORES );
    resolve(this.result);
  };
});

return DB;
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE[]} tables 
*/
function CREATE(db, tables) {
//TODO Should lock?
for(const table of tables) {
  if(!db.objectStoreNames.contains(table.name)) {
    const store = db.createObjectStore(table.name, {
      keyPath: table.store.primary,
      autoIncrement: table.store.autoIncrement,
    });

    store.createIndex( table.store.primary, table.store.primary, { unique: true, } );

    for(const col of table.store.indexes) {
      if(col?.length > 0) {
        store.createIndex( col.join(', '), col );
      } else {
        store.createIndex( col, col );
      }
    }
  }
}
}

/**
* @param {IDBDatabase} db
* @param {DB_STORE} table
* @param {'readonly' |'readwrite'} mode
* @param {?Function} callError
*/
function FROM(db, table, mode, callError) {
try {
  const TX = db.transaction(table.name, mode);
  callError ? TX.onerror = (ev) => {
    callError(ev);
    throw ev.target.error;
  } : null;
  return TX.objectStore(table.name);
} catch (error) {
  console.error(error);
}
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param {{ value: any, key: ?any}} item
* @returns {Promise<any>}
*/
function ADD(db, table, item) {
const OPS = FROM(db, table, 'readwrite', (errorEv) => {
  if (errorEv.target.error.name === 'QuotaExceededError') {
    //TODO do something
    throw errorEv.target.error;
  } else {
    errorEv.preventDefault();
  }
});

return new Promise((res) => {
  const result = OPS.add(item.value, item?.key);
  result.onsuccess = (key) => {
    res(key);
  }
});
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param {{ value: any, key: any}} item
* @returns {Promise<any>}
*/
function UPDATE(db, table, item) {
const OPS = FROM(db, table, 'readwrite', (errorEv) => {
  if (errorEv.target.error.name === 'QuotaExceededError') {
    //TODO do something
    throw errorEv.target.error;
  } else {
    errorEv.preventDefault();
  }
});

return new Promise((res) => {
  const result = OPS.put(item.value, item.key);
  result.onsuccess = (key) => {
    res(key);
  }
});
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param { {WHERE: (any|IDBKeyRange), COUNT: number?}? } query
* @returns {Promise<any[]>}
*/
function SELECT_ALL_IN(db, table, query) {
const OPS = FROM(db, table, 'readonly');

return new Promise((res) => {
  const result = OPS.getAll(query?.WHERE, query.SORT);
  result.onsuccess = (array) => {
    res(array);
  }
});
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param { {WHERE: (any|IDBKeyRange), SORT: ('next'|'nextunique'|'prev'|'prevunique')?}? } query
* @returns {Promise<any>}
*/
function SELECT_ITER_IN(db, table, callBack, query) {
const OPS = FROM(db, table, 'readonly');

return new Promise(() => {
  const cursor = OPS.openCursor(query?.WHERE, query.SORT);
  if (cursor) {
    cursor.onsuccess = (record) => {
      callBack(record);
    }
    cursor.continue();
  } else {
    // no more results
  }
});
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param {any} key
* @returns {Promise<any>}
*/
function SELECT_IS_EQ(db, table, key) {
const OPS = FROM(db, table, 'readonly');

return new Promise((res) => {
  const result = OPS.get(key);
  result.onsuccess = (record) => {
    res(record);
  }
});
}

/**
* @param {IDBDatabase} db
* @param {DB_STORE} table
* @returns {Promise<undefined>}
*/
function REMOVE_ALL(db, table) {
const OPS = FROM(db, table, 'readwrite');

return new Promise((res) => {
  const result = OPS.clear();
  result.onsuccess = () => {
    res(undefined);
  }
});
}