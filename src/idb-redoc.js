//TODO protect views from reloading constantly....?
//TODO when database updated to cloud... what do i do

/**
 * @typedef {string} STORE_NAME
 * 
 * @typedef {{
 *  name: string,
 *  primary: string, 
 *  autoIncrement: boolean, 
 *  indexes: Array<string>, 
 * }} DB_STORE
 * 
 * @typedef {Map<STORE_NAME,DB_STORE>} DB_STORES
 * 
 * * DB_STORES - EXAMPLE --- 
 *  db_stores = new Map([
 *  [ name1, { primary: .., auto: .., indexes: [...] }], 
 *  [ name1, { primary: .., auto: .., indexes: [...] }], 
 *  [ name3, { primary: .., auto: .., indexes: [...] }], 
 * ]);
*/

/**
* @param {string} name 
* @param {long} version 
* @param {DB_STORES} storeStructs
* @returns {Promise<IDBDatabase>}
*/
export function IDB_connect(name, version, storeStructs) {

  const DB = new Promise( (resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onsuccess = function (_ev) {
      const DB = this.result;

      DB.onversionchange = function() {
        DB.close();
        if(window.confirm('Page must be refreshed due to updated version.\nClick OK to refresh.')) {
          window.location.reload();
        } else {
          reject('Reload Page');
        }
      }

      resolve(DB);
    };

    request.onerror = function (ev) {
      console.error("openDb:", ev.target.error);
      reject(ev.target.error);
    };

    request.onupgradeneeded = function (_ev) {
      IDB_create( this.result, storeStructs );
      resolve(this.result);
    };
  });

  return DB;
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORES} tables 
*/
function IDB_create(db, tables) {

  for(const [storeName, store] of tables) {
    if(!db.objectStoreNames.contains(storeName)) {
      const oStore = db.createObjectStore(storeName, {
        keyPath: store.primary,
        autoIncrement: store.autoIncrement,
      });

      oStore.createIndex( store.primary, store.primary, { unique: true, } );

      for(const col of store.indexes) {
        if(col.includes(',')) {
          let indeces = col.split(',');
          oStore.createIndex( col, [indeces[0].trim(), indeces[1].trim()] );
        } else {
          oStore.createIndex( col, col );
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
export function IDB_from(db, table, mode, callError) {
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
export function IDB_add(db, table, item) {

  const OPS = IDB_from(db, table, 'readwrite', (errorEv) => {
    if (errorEv.target.error.name === 'QuotaExceededError') {
      //TODO do something
      throw errorEv.target.error;
    } else {
      errorEv.preventDefault();
    }
  });

  return new Promise((res) => {
    const result = OPS.add(item.value, item?.key);
    result.onsuccess = (ev) => {
      res(ev.target.result); //record's id
    }
  });
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param {{ value: any, key: any}} item
* @returns {Promise<any>}
*/
export function IDB_update(db, table, item) {

  const OPS = IDB_from(db, table, 'readwrite', (errorEv) => {
    if (errorEv.target.error.name === 'QuotaExceededError') {
      //TODO do something
      throw errorEv.target.error;
    } else {
      errorEv.preventDefault();
    }
  });

  return new Promise((res) => {
    const result = OPS.put(item.value, item.key);
    result.onsuccess = (ev) => {
      res(ev.target.result);//record's id
    }
  });
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param { {WHERE: (any|IDBKeyRange), COUNT: number?}? } query
* @returns {Promise<any[]>}
*/
export function IDB_select_ALLIN(db, table, query) {

  const OPS = IDB_from(db, table, 'readonly');

  return new Promise((res) => {
    const result = OPS.getAll(query?.WHERE, query?.COUNT);
    result.onsuccess = (ev) => {
      res(ev.target.result);//array<any>
    }
  });
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param { {WHERE: (any|IDBKeyRange), SORT: ('next'|'nextunique'|'prev'|'prevunique')?}? } query
* @returns {Promise<boolean>}
*/
export function IDB_select_IN(db, table, callBack, query) {

  const OPS = IDB_from(db, table, 'readonly');

  return new Promise((res, rej) => {
    const cursor = OPS.openCursor(query?.WHERE, query?.SORT);
    if (cursor) {
      cursor.onsuccess = (ev) => {
        callBack(ev.target.result);//record
      }
      cursor.continue();
    } else {
      res(false);
      rej(false);
    }
  });
}

/**
* @param {IDBDatabase} db 
* @param {DB_STORE} table
* @param {any} key
* @returns {Promise<any>}
*/
export function IDB_select_IS(db, table, key) {

  const OPS = IDB_from(db, table, 'readonly');

  return new Promise((res) => {
    const result = OPS.get(key);
    result.onsuccess = (ev) => {
      res(ev.target.result); //record
    }
  });
}

/**
* @param {IDBDatabase} db
* @param {DB_STORE} table
* @returns {Promise<undefined>}
*/
export function IDB_remove(db, table) {

  const OPS = IDB_from(db, table, 'readwrite');

  return new Promise((res) => {
    const result = OPS.clear();
    result.onsuccess = (_ev) => {
      res(undefined);
    }
  });
}