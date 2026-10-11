/**
 * Where the compared files come from, and reading them.
 *
 * Chrome and Edge hand out handles (File System Access): a folder can be read
 * again for a refresh, and remembered between visits. Firefox and Safari pick
 * a folder with <input webkitdirectory>, which gives a snapshot of its files.
 * Dropped folders come as handles where the browser has them, and as entries
 * (webkitGetAsEntry) everywhere else. Whatever the way, a folder becomes a
 * tree of plain entries for src/core/folder.ts, each file keeping what it
 * takes to read it.
 */

import type { Entry } from '../core/folder';

export type SideName = 'left' | 'right';

export interface Source {
  kind: 'dir' | 'file';
  name: string;
  handle?: FileSystemDirectoryHandle | FileSystemFileHandle;
  entry?: FileSystemEntry;
  /** <input webkitdirectory>: every file, its path from the folder's own name. */
  files?: File[];
  file?: File;
}

interface FileRef {
  handle?: FileSystemFileHandle;
  entry?: FileSystemFileEntry;
  file?: File;
}

/** Can the source be read again from disk, for a refresh? */
export const canRescan = (source: Source): boolean => !!(source.handle || source.entry);

export const hasDirectoryPicker = (): boolean => typeof window.showDirectoryPicker === 'function';

/* ------------------------------------------------------------------ *
 * Picking
 * ------------------------------------------------------------------ */

/** A pick still waiting on each input: browsers without the cancel event never end it themselves. */
const waiting = new WeakMap<HTMLInputElement, (files: File[]) => void>();

/** The files the user picks with an <input type=file>; none when they cancel. */
function fromInput(input: HTMLInputElement): Promise<File[]> {
  waiting.get(input)?.([]);
  return new Promise((resolve) => {
    input.value = '';
    const done = (files: File[]): void => {
      input.removeEventListener('change', onChange);
      input.removeEventListener('cancel', onCancel);
      waiting.delete(input);
      resolve(files);
    };
    waiting.set(input, done);
    const onChange = (): void => done(Array.from(input.files ?? []));
    const onCancel = (): void => done([]);
    input.addEventListener('change', onChange);
    input.addEventListener('cancel', onCancel);
    input.click();
  });
}

/** A folder, from the system's folder picker or an <input webkitdirectory>. Null when cancelled. */
export async function pickDirectory(side: SideName, input: HTMLInputElement): Promise<Source | null> {
  if (window.showDirectoryPicker) {
    try {
      const handle = await window.showDirectoryPicker({ id: `html-merge-${side}`, mode: 'read' });
      return { kind: 'dir', name: handle.name, handle };
    } catch (error) {
      if ((error as Error).name === 'AbortError') return null;
      // In a sandboxed frame the picker is refused; the input still works, if no longer in the same click.
      if ((error as Error).name !== 'SecurityError') throw error;
    }
  }
  const files = await fromInput(input);
  const first = files[0];
  if (!first) return null;
  return { kind: 'dir', name: first.webkitRelativePath.split('/')[0] || first.name, files };
}

export async function pickFile(side: SideName, input: HTMLInputElement): Promise<Source | null> {
  if (window.showOpenFilePicker) {
    try {
      const [handle] = await window.showOpenFilePicker({ id: `html-merge-${side}` });
      return handle ? { kind: 'file', name: handle.name, handle } : null;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return null;
      if ((error as Error).name !== 'SecurityError') throw error;
    }
  }
  const [file] = await fromInput(input);
  return file ? { kind: 'file', name: file.name, file } : null;
}

/**
 * What was dropped, as sources. Every handle and entry is asked for before
 * the first await: after it the DataTransfer is empty.
 */
export async function sourcesFromDrop(data: DataTransfer): Promise<Source[]> {
  const items = Array.from(data.items).filter((item) => item.kind === 'file');
  const taken = items.map((item) => ({
    handle: item.getAsFileSystemHandle?.().catch(() => null) ?? Promise.resolve(null),
    entry: item.webkitGetAsEntry?.() ?? null,
    file: item.getAsFile(),
  }));
  const out: Source[] = [];
  for (const { handle: pending, entry, file } of taken) {
    const handle = await pending;
    if (handle?.kind === 'directory') out.push({ kind: 'dir', name: handle.name, handle: handle as FileSystemDirectoryHandle });
    else if (handle?.kind === 'file') out.push({ kind: 'file', name: handle.name, handle: handle as FileSystemFileHandle });
    else if (entry?.isDirectory) out.push({ kind: 'dir', name: entry.name, entry });
    else if (entry?.isFile) out.push({ kind: 'file', name: entry.name, entry, file: file ?? undefined });
    else if (file) out.push({ kind: 'file', name: file.name, file });
  }
  return out;
}

/** A remembered handle needs the user's leave again; asking needs a click. */
export async function ensureAccess(source: Source): Promise<boolean> {
  const handle = source.handle;
  if (!handle?.queryPermission) return true;
  if ((await handle.queryPermission({ mode: 'read' })) === 'granted') return true;
  try {
    return (await handle.requestPermission?.({ mode: 'read' })) === 'granted';
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Reading a folder
 * ------------------------------------------------------------------ */

export type Exclude = (path: string, name: string, isDir: boolean) => boolean;

/** Runs at most `limit` of the tasks at once. */
function limiter(limit: number): <T>(task: () => Promise<T>) => Promise<T> {
  let running = 0;
  const queue: (() => void)[] = [];
  return (task) =>
    new Promise((resolve, reject) => {
      const start = (): void => {
        running += 1;
        task()
          .then(resolve, reject)
          .finally(() => {
            running -= 1;
            queue.shift()?.();
          });
      };
      if (running < limit) start();
      else queue.push(start);
    });
}

const fileOf = (entry: FileSystemFileEntry): Promise<File> => new Promise((resolve, reject) => entry.file(resolve, reject));

async function readAllEntries(dir: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = dir.createReader();
  const all: FileSystemEntry[] = [];
  // readEntries hands them out in batches (100 in Chrome) until an empty one.
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) return all;
    all.push(...batch);
  }
}

/**
 * The tree of a source: a folder with everything in it that `exclude` lets
 * through, or a single file. `onCount` hears how many files were found so far.
 */
export async function scan(source: Source, exclude: Exclude, onCount: (files: number) => void, cancelled: () => boolean): Promise<Entry> {
  let count = 0;
  const found = (): void => {
    count += 1;
    if (count % 50 === 0) onCount(count);
  };
  const limit = limiter(48);
  const check = (): void => {
    if (cancelled()) throw new DOMException('Cancelled', 'AbortError');
  };

  if (source.kind === 'file') {
    const ref: FileRef = { handle: source.handle as FileSystemFileHandle | undefined, entry: source.entry as FileSystemFileEntry | undefined, file: source.file };
    const file = ref.file ?? (ref.handle ? await ref.handle.getFile() : ref.entry ? await fileOf(ref.entry) : null);
    if (!file) throw new Error('No file');
    ref.file = file;
    return { name: source.name, kind: 'file', size: file.size, modified: file.lastModified, ref };
  }

  const fileEntry = (name: string, file: File, ref: FileRef): Entry => {
    found();
    return { name, kind: 'file', size: file.size, modified: file.lastModified, ref: { ...ref, file } };
  };

  if (source.handle) {
    const walk = async (dir: FileSystemDirectoryHandle, path: string): Promise<Entry[]> => {
      check();
      const handles: FileSystemHandle[] = [];
      await limit(async () => {
        for await (const handle of dir.values()) handles.push(handle);
      });
      const children = await Promise.all(
        handles.map(async (handle): Promise<Entry | null> => {
          const childPath = path ? `${path}/${handle.name}` : handle.name;
          if (exclude(childPath, handle.name, handle.kind === 'directory')) return null;
          if (handle.kind === 'directory') return { name: handle.name, kind: 'dir', size: 0, modified: 0, children: await walk(handle as FileSystemDirectoryHandle, childPath) };
          const fileHandle = handle as FileSystemFileHandle;
          try {
            return fileEntry(handle.name, await limit(() => fileHandle.getFile()), { handle: fileHandle });
          } catch {
            // A file the system will not open (locked, gone) is still listed; reading it reports the error.
            return { name: handle.name, kind: 'file', size: 0, modified: 0, ref: { handle: fileHandle }, unreadable: true };
          }
        }),
      );
      return children.filter((child): child is Entry => child !== null);
    };
    const dir = source.handle as FileSystemDirectoryHandle;
    const tree: Entry = { name: source.name, kind: 'dir', size: 0, modified: 0, children: await walk(dir, '') };
    onCount(count);
    return tree;
  }

  if (source.entry) {
    const walk = async (dir: FileSystemDirectoryEntry, path: string): Promise<Entry[]> => {
      check();
      const entries = await limit(() => readAllEntries(dir));
      const children = await Promise.all(
        entries.map(async (entry): Promise<Entry | null> => {
          const childPath = path ? `${path}/${entry.name}` : entry.name;
          if (exclude(childPath, entry.name, entry.isDirectory)) return null;
          if (entry.isDirectory) return { name: entry.name, kind: 'dir', size: 0, modified: 0, children: await walk(entry as FileSystemDirectoryEntry, childPath) };
          try {
            return fileEntry(entry.name, await limit(() => fileOf(entry as FileSystemFileEntry)), { entry: entry as FileSystemFileEntry });
          } catch {
            return { name: entry.name, kind: 'file', size: 0, modified: 0, ref: { entry }, unreadable: true };
          }
        }),
      );
      return children.filter((child): child is Entry => child !== null);
    };
    const tree: Entry = { name: source.name, kind: 'dir', size: 0, modified: 0, children: await walk(source.entry as FileSystemDirectoryEntry, '') };
    onCount(count);
    return tree;
  }

  // <input webkitdirectory>: the paths say where each file is; the folders are made from them.
  const root: Entry = { name: source.name, kind: 'dir', size: 0, modified: 0, children: [] };
  const folders = new Map<string, Entry>([['', root]]);
  const folder = (path: string): Entry | null => {
    const existing = folders.get(path);
    if (existing) return existing;
    const slash = path.lastIndexOf('/');
    const name = path.slice(slash + 1);
    if (exclude(path, name, true)) return null;
    const parent = folder(slash < 0 ? '' : path.slice(0, slash));
    if (!parent) return null;
    const made: Entry = { name, kind: 'dir', size: 0, modified: 0, children: [] };
    parent.children?.push(made);
    folders.set(path, made);
    return made;
  };
  for (const file of source.files ?? []) {
    const path = file.webkitRelativePath.split('/').slice(1).join('/') || file.name;
    const slash = path.lastIndexOf('/');
    const parent = folder(slash < 0 ? '' : path.slice(0, slash));
    if (!parent || exclude(path, file.name, false)) continue;
    parent.children?.push(fileEntry(file.name, file, { file }));
  }
  onCount(count);
  return root;
}

/** A file to read; a stale snapshot is taken again through its handle or entry. */
export async function openEntry(entry: Entry, fresh = false): Promise<File> {
  const ref = (entry.ref ?? {}) as FileRef;
  if (ref.file && !fresh) return ref.file;
  const file = ref.handle ? await ref.handle.getFile() : ref.entry ? await fileOf(ref.entry) : ref.file;
  if (!file) throw new Error('Nothing to read');
  ref.file = file;
  return file;
}

/** A file's bytes. A snapshot the file has changed since cannot be read; its handle or entry gives a new one. */
export async function readEntry(entry: Entry): Promise<Uint8Array> {
  try {
    return new Uint8Array(await (await openEntry(entry)).arrayBuffer());
  } catch (error) {
    const ref = (entry.ref ?? {}) as FileRef;
    if (!ref.handle && !ref.entry) throw error;
    return new Uint8Array(await (await openEntry(entry, true)).arrayBuffer());
  }
}
