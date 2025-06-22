export const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CivicBridgeDB', 1);
  
      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('policies')) {
          db.createObjectStore('policies', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  };
  
  export const cacheData = async (storeName, data) => {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      if (Array.isArray(data)) {
        data.forEach(item => store.put(item));
      } else {
        store.put(data);
      }
      
      return tx.complete;
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };
  
  export const getCachedData = async (storeName, key) => {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      
      if (key) {
        return new Promise((resolve) => {
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
        });
      } else {
        return new Promise((resolve) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve([]);
        });
      }
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  };