/**
 * Recent comparisons: pairs of handles kept in IndexedDB, so a comparison can
 * be opened again on the next visit with a click (and the browser's leave to
 * read the folders again). Only handles are kept — no names of files inside,
 * no contents. Browsers without handles keep nothing here.
 */

import type { Source } from './sources';

export interface RecentSide {
  kind: 'dir' | 'file';
  name: string;
  handle: FileSystemDirectoryHandle | FileSystemFileHandle;
}

export interface Recent {
  id: string;
  left: RecentSide;
  right: RecentSide;
  at: number;
}

const DB = 'html-merge';
const STORE = 'recent';
const KEEP = 8;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await open();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const request = work(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request ? request.result : undefined);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function listRecent(): Promise<Recent[]> {
  try {
    const all = (await run<Recent[]>('readonly', (store) => store.getAll())) ?? [];
    return all.sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

const sideOf = (source: Source): RecentSide | null => (source.handle ? { kind: source.kind, name: source.name, handle: source.handle } : null);

/** Remembers a pair, if both sides have handles; the same pair moves to the top. */
export async function remember(left: Source, right: Source): Promise<void> {
  const l = sideOf(left);
  const r = sideOf(right);
  if (!l || !r) return;
  try {
    const all = await listRecent();
    let same: Recent | undefined;
    for (const item of all) {
      if ((await item.left.handle.isSameEntry(l.handle)) && (await item.right.handle.isSameEntry(r.handle))) same = item;
    }
    const id = same?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await run('readwrite', (store) => store.put({ id, left: l, right: r, at: Date.now() } satisfies Recent));
    const stale = all.filter((item) => item.id !== id).slice(KEEP - 1);
    if (stale.length) await run('readwrite', (store) => void stale.forEach((item) => store.delete(item.id)));
  } catch {
    /* IndexedDB refused (private mode): nothing is remembered */
  }
}

export async function forget(id: string): Promise<void> {
  try {
    await run('readwrite', (store) => store.delete(id));
  } catch {
    /* nothing to forget */
  }
}

export const sourceOf = (side: RecentSide): Source => ({ kind: side.kind, name: side.name, handle: side.handle });
