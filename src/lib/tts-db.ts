const DB_NAME = "tts-history-db";
const DB_VERSION = 1;
const STORE_NAME = "records";
const INDEX_NAME = "createdAtIdx";
export const MAX_TOTAL_SIZE = 30 * 1024 * 1024; // 30MB

export interface TtsHistoryRecord {
  id: string;
  voiceId: string;
  voiceName: string;
  text: string;
  audioBlob: Blob;
  createdAt: number;
}

export class TtsDbError extends Error {
  static NotAvailable = new TtsDbError("IndexedDB not available");
  static QuotaExceeded = new TtsDbError("Storage quota exceeded");

  constructor(message: string) {
    super(message);
    this.name = "TtsDbError";
  }
}

export function isSupported(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject(TtsDbError.NotAvailable);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(TtsDbError.NotAvailable);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex(INDEX_NAME, "createdAt", { unique: false });
      }
    };
  });
}

export async function addRecord(record: TtsHistoryRecord): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      if (request.error?.name === "QuotaExceededError") {
        reject(TtsDbError.QuotaExceeded);
      } else {
        reject(request.error ?? new Error("Failed to add record"));
      }
    };
  });
}

export async function getAllRecords(): Promise<TtsHistoryRecord[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      db.close();
      const records = (request.result as TtsHistoryRecord[]).sort(
        (a, b) => b.createdAt - a.createdAt
      );
      resolve(records);
    };

    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error("Failed to read records"));
    };
  });
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error("Failed to delete record"));
    };
  });
}

export async function deleteOldestIfNeeded(
  newBlobSize: number,
  maxTotalSize = MAX_TOTAL_SIZE
): Promise<boolean> {
  const records = await getAllRecords();
  if (records.length === 0) return false;

  const currentSize = records.reduce((sum, r) => sum + r.audioBlob.size, 0);
  if (currentSize + newBlobSize <= maxTotalSize) {
    return false;
  }

  // Delete oldest records until we have enough space
  const sorted = [...records].sort((a, b) => a.createdAt - b.createdAt);
  let freed = 0;
  const needToFree = currentSize + newBlobSize - maxTotalSize;

  for (const record of sorted) {
    await deleteRecord(record.id);
    freed += record.audioBlob.size;
    if (freed >= needToFree) break;
  }

  return true;
}

export async function clearAllRecords(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error("Failed to clear records"));
    };
  });
}
