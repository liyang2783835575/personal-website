import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isSupported,
  addRecord,
  getAllRecords,
  deleteRecord,
  deleteOldestIfNeeded,
  TtsDbError,
  type TtsHistoryRecord,
} from "./tts-db";

// Shared in-memory store so all DB instances see the same data
const sharedStoreData = new Map<string, TtsHistoryRecord>();

// In-memory mock for IndexedDB
class MockIDBRequest {
  result: unknown = null;
  error: Error | null = null;
  onsuccess: ((this: MockIDBRequest, ev: Event) => void) | null = null;
  onerror: ((this: MockIDBRequest, ev: Event) => void) | null = null;

  constructor(result?: unknown, error?: Error) {
    if (result !== undefined) this.result = result;
    if (error) this.error = error;
  }

  triggerSuccess(result?: unknown) {
    if (result !== undefined) this.result = result;
    this.onsuccess?.call(this, new Event("success"));
  }

  triggerError(message: string) {
    this.error = new Error(message);
    this.onerror?.call(this, new Event("error"));
  }
}

class MockIDBObjectStore {
  private data = sharedStoreData;

  put(record: TtsHistoryRecord) {
    const req = new MockIDBRequest();
    queueMicrotask(() => {
      this.data.set(record.id, { ...record });
      req.triggerSuccess();
    });
    return req as unknown as IDBRequest;
  }

  getAll() {
    const req = new MockIDBRequest();
    queueMicrotask(() => {
      const records = Array.from(this.data.values()).sort(
        (a, b) => b.createdAt - a.createdAt
      );
      req.triggerSuccess(records);
    });
    return req as unknown as IDBRequest;
  }

  delete(id: string) {
    const req = new MockIDBRequest();
    queueMicrotask(() => {
      this.data.delete(id);
      req.triggerSuccess();
    });
    return req as unknown as IDBRequest;
  }

  index() {
    return {
      openCursor: () => {
        const req = new MockIDBRequest();
        const records = Array.from(this.data.values()).sort(
          (a, b) => a.createdAt - b.createdAt
        );
        let cursorIndex = 0;
        const cursor = {
          value: records[0] ?? null,
          continue: () => {
            cursorIndex++;
            const next = records[cursorIndex] ?? null;
            if (next) {
              cursor.value = next;
              req.onsuccess?.call(req, new Event("success"));
            } else {
              cursor.value = null;
              req.onsuccess?.call(req, new Event("success"));
            }
          },
        };
        queueMicrotask(() => {
          req.result = cursor;
          req.onsuccess?.call(req, new Event("success"));
        });
        return req as unknown as IDBRequest;
      },
    };
  }

  get size() {
    return this.data.size;
  }
}

class MockIDBTransaction {
  store = new MockIDBObjectStore();

  objectStore() {
    return this.store as unknown as IDBObjectStore;
  }
}

class MockIDBDatabase {
  private tx = new MockIDBTransaction();

  transaction(_storeNames?: string | string[], _mode?: IDBTransactionMode) {
    return this.tx as unknown as IDBTransaction;
  }

  close() {
    // no-op in mock
  }
}

function createMockIDBOpenRequest(db = new MockIDBDatabase()) {
  const req = new MockIDBRequest();
  queueMicrotask(() => {
    req.result = db as unknown as IDBDatabase;
    req.onsuccess?.call(req, new Event("success"));
  });
  return req as unknown as IDBOpenDBRequest;
}

// Replace global indexedDB before each test
beforeEach(() => {
  vi.stubGlobal(
    "indexedDB",
    {
      open: vi.fn(() => createMockIDBOpenRequest()),
    } as unknown as IDBFactory
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  sharedStoreData.clear();
});

function makeRecord(overrides?: Partial<TtsHistoryRecord>): TtsHistoryRecord {
  return {
    id: crypto.randomUUID(),
    voiceId: "冰糖",
    voiceName: "冰糖",
    text: "测试文本",
    audioBlob: new Blob(["audio-data"], { type: "audio/wav" }),
    createdAt: Date.now(),
    ...overrides,
  };
}

describe("isSupported", () => {
  it("returns true when indexedDB is available", () => {
    expect(isSupported()).toBe(true);
  });

  it("returns false when indexedDB is missing", () => {
    vi.stubGlobal("indexedDB", undefined);
    expect(isSupported()).toBe(false);
  });
});

describe("addRecord + getAllRecords", () => {
  it("adds a record and retrieves it", async () => {
    const record = makeRecord();
    await addRecord(record);
    const records = await getAllRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(record.id);
    expect(records[0].voiceName).toBe("冰糖");
  });

  it("returns records sorted by createdAt descending", async () => {
    const old = makeRecord({ createdAt: 1000 });
    const recent = makeRecord({ createdAt: 3000 });
    await addRecord(old);
    await addRecord(recent);
    const records = await getAllRecords();
    expect(records[0].createdAt).toBe(3000);
    expect(records[1].createdAt).toBe(1000);
  });
});

describe("deleteRecord", () => {
  it("deletes a record by id", async () => {
    const r1 = makeRecord();
    const r2 = makeRecord();
    await addRecord(r1);
    await addRecord(r2);
    await deleteRecord(r1.id);
    const records = await getAllRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(r2.id);
  });
});

describe("deleteOldestIfNeeded", () => {
  it("does nothing when total size is under limit", async () => {
    const r = makeRecord({ audioBlob: new Blob(["x"]) });
    await addRecord(r);
    const deleted = await deleteOldestIfNeeded(100); // 100 bytes limit, but record is tiny
    expect(deleted).toBe(false);
    const records = await getAllRecords();
    expect(records).toHaveLength(1);
  });

  it("deletes oldest record when total size exceeds limit", async () => {
    const old = makeRecord({
      createdAt: 1000,
      audioBlob: new Blob([new Uint8Array(20)]),
    });
    const recent = makeRecord({
      createdAt: 2000,
      audioBlob: new Blob([new Uint8Array(20)]),
    });
    await addRecord(old);
    await addRecord(recent);
    const all = await getAllRecords();
    expect(all[0].audioBlob.size).toBe(20);
    // currentSize=40, newBlobSize=10, limit=30 → needToFree=20
    // should delete only the oldest record
    const deleted = await deleteOldestIfNeeded(10, 30);
    expect(deleted).toBe(true);
    const records = await getAllRecords();
    expect(records).toHaveLength(1);
    expect(records[0].createdAt).toBe(2000);
  });
});

describe("error handling", () => {
  it("throws NotAvailable when indexedDB.open fails", async () => {
    vi.stubGlobal(
      "indexedDB",
      {
        open: vi.fn(() => {
          const req = new MockIDBRequest();
          queueMicrotask(() => req.triggerError("denied"));
          return req as unknown as IDBOpenDBRequest;
        }),
      } as unknown as IDBFactory
    );
    await expect(addRecord(makeRecord())).rejects.toThrow(TtsDbError.NotAvailable);
  });
});
