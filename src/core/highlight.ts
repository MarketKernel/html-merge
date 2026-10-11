/**
 * A small syntax highlighter: a state machine of sticky regular expressions,
 * in the spirit of Monaco's Monarch, run over a whole file once, line by line.
 *
 * A grammar is a set of named states, each a list of rules tried in order at
 * the current position. A rule colours what it matches and may push a state
 * (a block comment, a string, a tag), pop back, or replace the top one. The
 * stack carries over from one line to the next, so a comment or a string that
 * spans lines is coloured on all of them — which is why the file is tokenized
 * whole, not row by row as the screen shows it.
 *
 * Each line gets a flat list of [start, end, type] triples; what no rule
 * matched is left out, and is plain text.
 */

export const TOKEN_TYPES = [
  'comment',
  'string',
  'number',
  'keyword',
  'type',
  'literal',
  'function',
  'meta',
  'regex',
  'variable',
  'tag',
  'attr',
  'property',
  'heading',
  'emphasis',
  'strong',
  'link',
  'code',
  'inserted',
  'deleted',
  'escape',
  'section',
  'selector',
] as const;

export type TokenType = (typeof TOKEN_TYPES)[number];

const TYPE_INDEX = new Map<TokenType, number>(TOKEN_TYPES.map((type, i) => [type, i]));

/** How a rule's identifier is coloured: by the set it is in, then by what follows it. */
export interface Words {
  keyword?: ReadonlySet<string>;
  type?: ReadonlySet<string>;
  literal?: ReadonlySet<string>;
  builtin?: ReadonlySet<string>;
  /** Followed by `(`: a function. */
  calls?: boolean;
  /** Starts with a capital and has a small letter: a type. */
  capitals?: boolean;
  /** The sets hold lower-case words and the language ignores case. */
  ignoreCase?: boolean;
}

export interface RuleSpec {
  match: RegExp;
  token?: TokenType;
  words?: Words;
  push?: string;
  pop?: boolean;
  next?: string;
  /** Pops every state whose name starts with this: the way out of an embedded language. */
  leave?: string;
  /** Only where nothing but whitespace comes before it on the line. */
  bol?: boolean;
  /** Only where a value cannot end, so a `/` there starts a regular expression, not a division. */
  regex?: boolean;
}

export interface StateSpec {
  rules: RuleSpec[];
  /** For text no rule matches: a comment's or a string's colour. */
  token?: TokenType;
  /** The state ends with its line: a string that cannot span lines. */
  eolPop?: boolean;
}

export interface Grammar {
  id: string;
  name: string;
  states: Record<string, StateSpec>;
}

interface Rule extends RuleSpec {
  re: RegExp;
}

interface State {
  rules: Rule[];
  token: number;
  eolPop: boolean;
}

/** Tokens of one line: start, end, type index, start, end, type index… */
export type LineTokens = number[];

const FALLBACK = /[\p{L}\p{N}_]+|\s+|[\s\S]/uy;

const compiled = new WeakMap<Grammar, Map<string, State>>();

function compile(grammar: Grammar): Map<string, State> {
  let states = compiled.get(grammar);
  if (states) return states;
  states = new Map();
  for (const [name, spec] of Object.entries(grammar.states)) {
    states.set(name, {
      rules: spec.rules.map((rule) => ({ ...rule, re: new RegExp(rule.match.source, rule.match.flags.replace(/[gy]/g, '') + 'y') })),
      token: spec.token ? (TYPE_INDEX.get(spec.token) as number) : -1,
      eolPop: spec.eolPop === true,
    });
  }
  compiled.set(grammar, states);
  return states;
}

function classify(word: string, words: Words, line: string, end: number): TokenType | undefined {
  const key = words.ignoreCase ? word.toLowerCase() : word;
  if (words.keyword?.has(key)) return 'keyword';
  if (words.type?.has(key)) return 'type';
  if (words.literal?.has(key)) return 'literal';
  if (words.builtin?.has(key)) return 'function';
  if (words.calls) {
    let at = end;
    while (line.charCodeAt(at) === 32) at += 1;
    if (line[at] === '(') return 'function';
  }
  if (words.capitals && /^[A-Z]/.test(word) && /[a-z]/.test(word)) return 'type';
  return undefined;
}

/** After one of these a `/` is a division. */
const VALUE_TYPES = new Set<number>(['number', 'string', 'variable', 'type', 'literal', 'function', 'regex'].map((t) => TYPE_INDEX.get(t as TokenType) as number));

/**
 * The tokens of every line of `lines`. Stops colouring after `budget`
 * characters, which keeps a huge file from freezing the page; the lines past
 * it stay plain.
 */
export function tokenize(lines: readonly string[], grammar: Grammar, budget = 4_000_000): LineTokens[] {
  const states = compile(grammar);
  const stack = ['root'];
  const out: LineTokens[] = [];
  let spent = 0;
  for (const line of lines) {
    spent += line.length + 1;
    if (spent > budget) {
      out.push([]);
      continue;
    }
    out.push(tokenizeLine(line, stack, states));
  }
  return out;
}

function tokenizeLine(line: string, stack: string[], states: Map<string, State>): LineTokens {
  const tokens: LineTokens = [];
  const push = (start: number, end: number, type: number): void => {
    if (type < 0 || end <= start) return;
    const n = tokens.length;
    if (n && tokens[n - 1] === type && tokens[n - 2] === start) tokens[n - 2] = end;
    else tokens.push(start, end, type);
  };
  let pos = 0;
  let atStart = true;
  let afterValue = false;
  // Zero-length matches that only change the state may not loop forever.
  let idle = 0;
  while (pos < line.length) {
    const state = states.get(stack[stack.length - 1] as string) ?? (states.get('root') as State);
    let text: string | null = null;
    let type = -1;
    for (const rule of state.rules) {
      if (rule.bol && !atStart) continue;
      if (rule.regex && afterValue) continue;
      rule.re.lastIndex = pos;
      const match = rule.re.exec(line);
      if (!match) continue;
      const found = match[0];
      const moves = rule.push !== undefined || rule.pop || rule.next !== undefined || rule.leave !== undefined;
      if (!found.length && (!moves || idle > 8)) continue;
      text = found;
      if (rule.words) {
        const kind = classify(found, rule.words, line, pos + found.length);
        const fallback = kind ?? rule.token;
        type = fallback ? (TYPE_INDEX.get(fallback) as number) : state.token;
      } else type = rule.token ? (TYPE_INDEX.get(rule.token) as number) : state.token;
      if (rule.leave !== undefined) while (stack.length > 1 && (stack[stack.length - 1] as string).startsWith(rule.leave)) stack.pop();
      if (rule.pop && stack.length > 1) stack.pop();
      if (rule.next !== undefined) stack[stack.length - 1] = rule.next;
      if (rule.push !== undefined) stack.push(rule.push);
      break;
    }
    if (text === null) {
      FALLBACK.lastIndex = pos;
      text = (FALLBACK.exec(line) as RegExpExecArray)[0];
      type = state.token;
    }
    if (!text.length) {
      idle += 1;
      continue;
    }
    idle = 0;
    push(pos, pos + text.length, type);
    pos += text.length;
    if (!/^\s+$/.test(text)) {
      atStart = false;
      if (type !== TYPE_INDEX.get('comment')) {
        const last = text[text.length - 1] as string;
        afterValue = VALUE_TYPES.has(type) || (type < 0 && /[\p{L}\p{N}_$)\]]/u.test(last));
      }
    }
  }
  while (stack.length > 1 && states.get(stack[stack.length - 1] as string)?.eolPop) stack.pop();
  return tokens;
}

/**
 * Another grammar's states inside this one, their names prefixed, each with
 * `exit` first: where `exit` matches, the embedded language ends, whatever
 * state it was in — HTML's </script> closes the script inside a string too.
 */
export function embed(states: Record<string, StateSpec>, grammar: Grammar, prefix: string, exit: RegExp): void {
  const rename = (name: string | undefined): string | undefined => (name === undefined ? undefined : prefix + name);
  for (const [name, spec] of Object.entries(grammar.states)) {
    states[prefix + name] = {
      ...spec,
      rules: [{ match: exit, leave: prefix }, ...spec.rules.map((rule) => ({ ...rule, push: rename(rule.push), next: rename(rule.next) }))],
    };
  }
}
