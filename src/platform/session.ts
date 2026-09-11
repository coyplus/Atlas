export interface StoredSession {
  schema: 1;
  scenarioVersion: string;
  state: unknown;
  savedAt: number;
}
const DB = 'hsbc-atlas-demo';
const KEY = 'session';
async function db() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onblocked = () => reject(new Error('Storage is busy'));
    request.onupgradeneeded = () => request.result.createObjectStore('sessions');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function loadSession(version: string): Promise<unknown | null> {
  try {
    const database = await db();
    return await new Promise((resolve) => {
      const tx = database.transaction('sessions');
      const req = tx.objectStore('sessions').get(KEY);
      req.onsuccess = () => {
        const x = req.result as StoredSession | undefined;
        resolve(
          x?.schema === 1 && x.scenarioVersion === version && validSession(x.state)
            ? x.state
            : null,
        );
        database.close();
      };
      req.onerror = () => {
        database.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}
let pending: ReturnType<typeof setTimeout> | undefined;
export function scheduleSave(state: unknown, version: string) {
  clearTimeout(pending);
  pending = setTimeout(() => void saveSession(state, version), 180);
}
export async function saveSession(state: unknown, version: string) {
  try {
    const copy = JSON.parse(JSON.stringify(state));
    const database = await db();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').put(
        {
          schema: 1,
          scenarioVersion: version,
          state: copy,
          savedAt: Date.now(),
        } satisfies StoredSession,
        KEY,
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  } catch (error) {
    window.dispatchEvent(new CustomEvent('atlas:storage-error', { detail: String(error) }));
  }
}

/** Reject malformed or incompatible snapshots instead of failing the whole application at boot. */
export function validSession(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, any>;
  if (
    !['alex', 'jordan', 'sam', 'elena'].includes(s.person) ||
    !['now', 'future', 'you'].includes(s.tab) ||
    !s.people
  )
    return false;
  return ['alex', 'jordan', 'sam', 'elena'].every((id) => {
    const p = s.people[id];
    return (
      p?.l1?.customer?.id === id &&
      Array.isArray(p.l1.accounts) &&
      Array.isArray(p.l1.pots) &&
      Array.isArray(p.l1.rules) &&
      Array.isArray(p.ui?.order) &&
      Array.isArray(p.ui?.history) &&
      Array.isArray(p.ui?.chat) &&
      p.ui?.scroll &&
      p.ui?.sizes &&
      p.l2
    );
  });
}
