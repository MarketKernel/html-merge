/**
 * Two folder trees side by side: which items are on both sides, which on one,
 * and whether the files on both are the same.
 *
 * The trees come from the page (sources.ts) as plain entries; here they are
 * merged by name into one tree of items, each with a status. A folder's status
 * follows from what is inside it. Whether two files are the same is decided
 * from their sizes and dates where that is enough, and from their bytes —
 * read by the page — where it is not.
 */

import { isBlank, lineKey, normalizes, type CompareOptions } from './diff';
import { bytesEqual, isBinary, readText } from './text';

export interface Entry {
  name: string;
  kind: 'file' | 'dir';
  size: number;
  /** Milliseconds since 1970; 0 when unknown. */
  modified: number;
  children?: Entry[];
  /** What the page needs to read the file again: a handle, a File, an entry. */
  ref?: unknown;
  /** The system would not open it while the folder was read. */
  unreadable?: boolean;
}

/**
 * same, different: files (or folders) on both sides; left, right: on one side
 * only; pending: not compared yet; error: could not be read.
 */
export type Status = 'pending' | 'same' | 'different' | 'left' | 'right' | 'error';

export interface Item {
  name: string;
  /** Relative to the compared folders, with / between the parts. */
  path: string;
  kind: 'file' | 'dir';
  depth: number;
  left?: Entry;
  right?: Entry;
  status: Status;
  children: Item[];
  parent: Item | null;
  /** Why it is an error, or how two files were found the same ("text"). */
  note?: string;
}

export type CompareMethod = 'content' | 'quick';

/** Dates closer than this are the same: FAT keeps them to two seconds. */
const DATE_SLACK = 2000;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Folders first, then by name as people sort them: file2 before file10. */
export function byName(a: { name: string; kind: string }, b: { name: string; kind: string }): number {
  if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
  return collator.compare(a.name, b.name) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}

export function mergeTrees(left: Entry, right: Entry, ignoreNameCase = false): Item {
  const root: Item = { name: '', path: '', kind: 'dir', depth: -1, left, right, status: 'pending', children: [], parent: null };
  mergeChildren(root, left.children ?? [], right.children ?? [], ignoreNameCase);
  aggregate(root);
  return root;
}

function mergeChildren(parent: Item, left: Entry[], right: Entry[], ignoreNameCase: boolean): void {
  const key = (entry: Entry): string => `${entry.kind}:${ignoreNameCase ? entry.name.toLowerCase() : entry.name}`;
  // Without case, A.txt and a.txt on one side are two keys' worth of entries: each pairs once, in order.
  const rights = new Map<string, Entry[]>();
  for (const entry of right) {
    const list = rights.get(key(entry));
    if (list) list.push(entry);
    else rights.set(key(entry), [entry]);
  }
  const items: Item[] = [];
  const add = (l: Entry | undefined, r: Entry | undefined): void => {
    const entry = (l ?? r) as Entry;
    const item: Item = {
      name: entry.name,
      path: parent.path ? `${parent.path}/${entry.name}` : entry.name,
      kind: entry.kind,
      depth: parent.depth + 1,
      left: l,
      right: r,
      status: l && r ? 'pending' : l ? 'left' : 'right',
      children: [],
      parent,
    };
    if (entry.kind === 'dir') mergeChildren(item, l?.children ?? [], r?.children ?? [], ignoreNameCase);
    items.push(item);
  };
  for (const entry of left) add(entry, rights.get(key(entry))?.shift());
  for (const list of rights.values()) for (const entry of list) add(undefined, entry);
  items.sort(byName);
  parent.children = items;
}

/** Folder statuses from the files inside them, bottom up. */
export function aggregate(item: Item): Status {
  if (item.kind === 'file') return item.status;
  let pending = false;
  let different = false;
  for (const child of item.children) {
    const status = aggregate(child);
    if (status === 'pending') pending = true;
    else if (status !== 'same') different = true;
  }
  if (item.left && item.right) item.status = different ? 'different' : pending ? 'pending' : 'same';
  return item.status;
}

/** Every file item of the tree, depth first, in order. */
export function files(root: Item): Item[] {
  const out: Item[] = [];
  const walk = (item: Item): void => {
    for (const child of item.children) {
      if (child.kind === 'file') out.push(child);
      else walk(child);
    }
  };
  walk(root);
  return out;
}

/**
 * The status of two files decided without reading them, or null when only
 * their bytes can tell.
 */
export function quickStatus(left: Entry, right: Entry, method: CompareMethod, options: CompareOptions): Status | null {
  if (left.unreadable || right.unreadable) return 'error';
  if (method === 'quick') {
    const dates = left.modified && right.modified ? Math.abs(left.modified - right.modified) <= DATE_SLACK : true;
    return left.size === right.size && dates ? 'same' : 'different';
  }
  if (left.size === 0 && right.size === 0) return 'same';
  if (left.size !== right.size && !normalizes(options)) return 'different';
  return null;
}

/** Two files' bytes, compared under the options: text that differs only in what they ignore is the same. */
export function contentStatus(a: Uint8Array, b: Uint8Array, options: CompareOptions): { status: Status; note?: string } {
  if (bytesEqual(a, b)) return { status: 'same' };
  if (!normalizes(options) || isBinary(a) || isBinary(b)) return { status: 'different' };
  const keys = (bytes: Uint8Array): string[] => {
    const text = readText(bytes);
    const out: string[] = [];
    text.lines.forEach((line, i) => {
      if (!(options.ignoreBlankLines && isBlank(line))) out.push(lineKey(line, text.eols[i] ?? '', options));
    });
    return out;
  };
  const ka = keys(a);
  const kb = keys(b);
  const same = ka.length === kb.length && ka.every((key, i) => key === kb[i]);
  return same ? { status: 'same', note: 'text' } : { status: 'different' };
}

export interface Counts {
  same: number;
  different: number;
  left: number;
  right: number;
  error: number;
  pending: number;
}

/** Files by status. */
export function countFiles(root: Item): Counts {
  const counts: Counts = { same: 0, different: 0, left: 0, right: 0, error: 0, pending: 0 };
  for (const item of files(root)) counts[item.status] += 1;
  return counts;
}

/* ------------------------------------------------------------------ *
 * What the list shows
 * ------------------------------------------------------------------ */

export interface Shown {
  same: boolean;
  different: boolean;
  left: boolean;
  right: boolean;
}

export type SortKey = 'name' | 'status' | 'size' | 'modified';

export interface ListOptions {
  show: Shown;
  /** Part of a name, or a pattern with * and ?. */
  filter: string;
  /** Folders opened in the tree, by path. */
  expanded: ReadonlySet<string>;
  flat: boolean;
  sort: SortKey;
  descending: boolean;
}

const STATUS_ORDER: Record<Status, number> = { different: 0, left: 1, right: 2, error: 3, pending: 4, same: 5 };

/** The list's order; `names` breaks ties by name, otherwise the caller breaks them. */
function comparator(sort: SortKey, descending: boolean, names = true): (a: Item, b: Item) => number {
  const sign = descending ? -1 : 1;
  const size = (item: Item): number => Math.max(item.left?.size ?? -1, item.right?.size ?? -1);
  const date = (item: Item): number => Math.max(item.left?.modified ?? 0, item.right?.modified ?? 0);
  return (a, b) => {
    if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
    let order = 0;
    if (sort === 'status') order = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sort === 'size') order = size(a) - size(b);
    else if (sort === 'modified') order = date(a) - date(b);
    return sign * order || (names ? sign * byName(a, b) : 0);
  };
}

function shown(item: Item, show: Shown): boolean {
  if (item.status === 'error' || item.status === 'pending') return true;
  return show[item.status];
}

/** A name filter: a part of the name, or with * or ? a pattern for the whole name. */
export function nameMatcher(filter: string): ((name: string) => boolean) | null {
  const text = filter.trim().toLowerCase();
  if (!text) return null;
  if (/[*?]/.test(text)) {
    const pattern = globToRegExp(text);
    return (name) => pattern.test(name.toLowerCase());
  }
  return (name) => name.toLowerCase().includes(text);
}

/**
 * The rows the folder list shows, in order. In the tree a folder is listed
 * when it or something inside it passes the filters, and its children only
 * when it is open — or when a name filter is typed, which opens everything.
 * Flat, only the files are listed, each with its path.
 */
export function listRows(root: Item, options: ListOptions): Item[] {
  const out: Item[] = [];
  const match = nameMatcher(options.filter);
  const order = comparator(options.sort, options.descending);
  const visible = new Map<Item, boolean>();
  const passes = (item: Item): boolean => {
    let result = visible.get(item);
    if (result !== undefined) return result;
    if (item.kind === 'file') result = shown(item, options.show) && (!match || match(item.name));
    else {
      result = item.children.some(passes);
      // An empty folder, or one that is on one side only, stands for itself.
      if (!result && (!match || match(item.name))) result = (!item.children.length || item.status === 'left' || item.status === 'right') && shown(item, options.show);
    }
    visible.set(item, result);
    return result;
  };
  if (options.flat) {
    // By name the tree's own order, folder by folder; by anything else that order breaks ties.
    const all = files(root).filter(passes);
    if (options.sort === 'name') return options.descending ? all.reverse() : all;
    const index = new Map(all.map((item, i) => [item, i]));
    const flatOrder = comparator(options.sort, options.descending, false);
    return all.sort((a, b) => flatOrder(a, b) || (index.get(a) as number) - (index.get(b) as number));
  }
  // mergeTrees sorts every folder by name already.
  const byNameAlready = options.sort === 'name' && !options.descending;
  const walk = (item: Item): void => {
    for (const child of byNameAlready ? item.children : [...item.children].sort(order)) {
      if (!passes(child)) continue;
      out.push(child);
      if (child.kind === 'dir' && (match || options.expanded.has(child.path))) walk(child);
    }
  };
  walk(root);
  return out;
}

/** Every folder path of the tree: what "expand all" opens. */
export function folderPaths(root: Item): string[] {
  const out: string[] = [];
  const walk = (item: Item): void => {
    for (const child of item.children) {
      if (child.kind !== 'dir') continue;
      out.push(child.path);
      walk(child);
    }
  };
  walk(root);
  return out;
}

/* ------------------------------------------------------------------ *
 * Excluded names
 * ------------------------------------------------------------------ */

export function globToRegExp(glob: string): RegExp {
  let source = '';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i] as string;
    if (char === '*') {
      if (glob[i + 1] === '*') {
        // `**/` is any number of folders, none included; `/**` at the end, anything below.
        i += 1;
        if (glob[i + 1] === '/') {
          source += '(?:.*/)?';
          i += 1;
        } else source += '.*';
      } else source += '[^/]*';
    } else if (char === '?') source += '[^/]';
    else if (char === '/' && glob.slice(i + 1) === '**') {
      source += '(?:/.*)?';
      break;
    } else source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${source}$`, 'i');
}

/**
 * The patterns of the exclude setting — separated by semicolons, commas or
 * new lines — as one test. A pattern without a slash is a name anywhere in
 * the tree (`node_modules`, `*.log`); with one it is a path from the top
 * (`build/`, `docs/*.pdf`); a trailing slash means folders only.
 */
export function excluder(patterns: string): (path: string, name: string, isDir: boolean) => boolean {
  const tests = patterns
    .split(/[;,\n]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pattern) => {
      const dirOnly = pattern.endsWith('/');
      const body = pattern.replace(/^\/+|\/+$/g, '');
      const byPath = body.includes('/') || pattern.startsWith('/');
      const re = globToRegExp(body);
      return (path: string, name: string, isDir: boolean): boolean => (!dirOnly || isDir) && re.test(byPath ? path : name);
    });
  return (path, name, isDir) => tests.some((test) => test(path, name, isDir));
}

export const DEFAULT_EXCLUDE = '.git; .svn; .hg; node_modules; .DS_Store; Thumbs.db; desktop.ini';
