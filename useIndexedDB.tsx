import { useEffect, useRef } from 'react';

interface IDBStore {
  get: (key: string) => Promise<any>;
  put: (key: string, value: any) => Promise<void>;
  del: (key: string) => Promise<void>;
}

const useIndexedDB = (dbName: string, storeName: string, version: number = 1): IDBStore => {
  const dbRequest = useRef<IDBOpenDBRequest | null>(null)
  const db = useRef<IDBDatabase | null>(null);
  useEffect(() => {
    dbRequest.current = window.indexedDB.open(dbName, version);
    dbRequest.current.onsuccess = () => {
      db.current = dbRequest.current.result;
    };
    dbRequest.current.onerror = (event: any) => {
      console.error(event.target.error);
    };
    dbRequest.current.onupgradeneeded = () => {
      db.current.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    };
  }, []);

  const get = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!db.current) {
        reject(new Error('Database not initialized'));
      }
      const transaction = db.current.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  };

  const put = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db.current) {
        reject(new Error('Database not initialized'));
      }
      console.log(db.current);
      const transaction = db.current.transaction([storeName], 'readwrite');

      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      console.log('store: ', store);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  };

  const del = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db.current) {
        reject(new Error('Database not initialized'));
      }
      const transaction = db.current.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  };

  return {
    get,
    put,
    del,
  };
};

export default useIndexedDB;
