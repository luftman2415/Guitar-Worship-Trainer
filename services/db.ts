
import { Recording } from '../types';

const DB_NAME = 'gwt_audio_db';
const DB_STORE = 'recordings';

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
};

export const saveRecordingToDB = async (recording: Recording): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DB_STORE], 'readwrite');
    tx.objectStore(DB_STORE).put(recording);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getRecordingsFromDB = async (): Promise<Recording[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DB_STORE], 'readonly');
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getRecordingById = async (id: string | number): Promise<Recording | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DB_STORE], 'readonly');
    const req = tx.objectStore(DB_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

export const deleteRecordingFromDB = async (id: string | number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DB_STORE], 'readwrite');
    const req = tx.objectStore(DB_STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};
