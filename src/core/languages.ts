/**
 * The languages the highlighter knows, and which one a file is in.
 *
 * Each grammar is a few states of rules (see highlight.ts). Most languages
 * are built from the same parts — comments, strings, numbers, identifiers
 * sorted into keywords, types and literals — so the definitions below are
 * mostly word lists. They aim at what a diff needs: telling code, comments
 * and strings apart at a glance, not a compiler's precision.
 */

import { embed, type Grammar, type RuleSpec, type StateSpec, type Words } from './highlight';

const set = (words: string): ReadonlySet<string> => new Set(words.split(/\s+/).filter(Boolean));

/* ------------------------------------------------------------------ *
 * Parts
 * ------------------------------------------------------------------ */

const NUMBER: RuleSpec = {
  match: /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.\d[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)[a-zA-Z]*/,
  token: 'number',
};

const ident = (words: Words, pattern = /[\p{L}_$][\p{L}\p{N}_$]*/u): RuleSpec => ({ match: pattern, words });

/** A comment state that ends with `close`. */
const commentState = (close: RegExp): StateSpec => ({ token: 'comment', rules: [{ match: close, token: 'comment', pop: true }] });

interface StringOptions {
  /** A backslash escapes the next character. */
  escape?: boolean;
  /** The string may span lines. */
  multiline?: boolean;
  /** Coloured as a variable inside the string: `${name}`, `#{x}`… */
  interpolation?: RegExp;
  /** Doubled, the closing quote stands for itself ('it''s'). */
  doubled?: string;
}

function stringState(close: RegExp, options: StringOptions = {}): StateSpec {
  const rules: RuleSpec[] = [];
  if (options.doubled) rules.push({ match: new RegExp(options.doubled), token: 'escape' });
  if (options.escape !== false) rules.push({ match: /\\(?:x[\da-fA-F]{2}|u\{[\da-fA-F]+\}|u[\da-fA-F]{4}|.)/, token: 'escape' });
  if (options.interpolation) rules.push({ match: options.interpolation, token: 'variable' });
  rules.push({ match: close, token: 'string', pop: true });
  return { token: 'string', eolPop: !options.multiline, rules };
}

interface CLikeOptions {
  id: string;
  name: string;
  keywords: string;
  types?: string;
  literals?: string;
  builtins?: string;
  /** Rules tried before the common ones. */
  before?: RuleSpec[];
  /** States those rules push. */
  states?: Record<string, StateSpec>;
  /** `#include` and the like at the start of a line. */
  preprocessor?: boolean;
  /** `@Override`, `@decorator`. */
  annotations?: boolean;
  /** Quotes for ordinary strings; a single quote is a character literal where it is not listed. */
  quotes?: string;
  /** `/regex/` where a value cannot end. */
  regex?: boolean;
  /** Capitalised words are types. */
  capitals?: boolean;
  /** `#` starts a line comment as well as `//`. */
  hashComments?: boolean;
  interpolation?: RegExp;
  multilineStrings?: boolean;
}

/** The languages with // and block comments and braces. */
function cLike(o: CLikeOptions): Grammar {
  const quotes = o.quotes ?? `"'`;
  const states: Record<string, StateSpec> = {
    comment: commentState(/\*\//),
    ...o.states,
  };
  const root: RuleSpec[] = [...(o.before ?? [])];
  root.push({ match: /\/\*/, token: 'comment', push: 'comment' }, { match: /\/\/.*/, token: 'comment' });
  if (o.hashComments) root.push({ match: /#.*/, token: 'comment' });
  if (o.preprocessor) root.push({ match: /#\s*[a-zA-Z]+/, token: 'meta', bol: true });
  for (const quote of quotes) {
    const name = `q${quote.charCodeAt(0)}`;
    states[name] = stringState(new RegExp(escapeRe(quote)), { multiline: o.multilineStrings, interpolation: quote === "'" ? undefined : o.interpolation });
    root.push({ match: new RegExp(escapeRe(quote)), token: 'string', push: name });
  }
  if (!quotes.includes("'")) root.push({ match: /'(?:\\(?:x[\da-fA-F]{2}|u\{?[\da-fA-F]+\}?|.)|[^\\'])'/, token: 'string' });
  if (o.regex) root.push({ match: /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\[])+\/[dgimsuyv]*/, token: 'regex', regex: true });
  if (o.annotations) root.push({ match: /@[\p{L}_][\p{L}\p{N}_.]*/u, token: 'meta' });
  root.push(NUMBER);
  root.push(
    ident({
      keyword: set(o.keywords),
      type: set(o.types ?? ''),
      literal: set(o.literals ?? ''),
      builtin: set(o.builtins ?? ''),
      calls: true,
      capitals: o.capitals,
    }),
  );
  states['root'] = { rules: root };
  return { id: o.id, name: o.name, states };
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ------------------------------------------------------------------ *
 * JavaScript and TypeScript
 * ------------------------------------------------------------------ */

const JS_KEYWORDS =
  'break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch throw try typeof var void while with yield async await of static get set from as';
const JS_LITERALS = 'true false null undefined NaN Infinity this';
const JS_BUILTINS = 'console window document globalThis require module exports process';

function script(id: string, name: string, keywords: string, types: string): Grammar {
  const rootRules = (): RuleSpec[] => [
    { match: /`/, token: 'string', push: 'template' },
    { match: /#!.*/, token: 'comment', bol: true },
  ];
  const grammar = cLike({
    id,
    name,
    keywords,
    types,
    literals: JS_LITERALS,
    builtins: JS_BUILTINS,
    before: rootRules(),
    annotations: true,
    regex: true,
    capitals: true,
    states: {
      template: {
        token: 'string',
        rules: [
          { match: /\\./, token: 'escape' },
          { match: /\$\{/, token: 'variable', push: 'interpolation' },
          { match: /`/, token: 'string', pop: true },
        ],
      },
    },
  });
  const root = grammar.states['root'] as StateSpec;
  // Inside ${…} the language itself, braces counted, until the brace that closes it.
  grammar.states['interpolation'] = { rules: [{ match: /\}/, token: 'variable', pop: true }, { match: /\{/, push: 'braces' }, ...root.rules] };
  grammar.states['braces'] = { rules: [{ match: /\}/, pop: true }, { match: /\{/, push: 'braces' }, ...root.rules] };
  return grammar;
}

const javascript = script('javascript', 'JavaScript', JS_KEYWORDS, '');
const typescript = script(
  'typescript',
  'TypeScript',
  `${JS_KEYWORDS} interface type enum namespace declare abstract implements private protected public readonly keyof infer is asserts satisfies override module unique accessor`,
  'string number boolean any unknown never void object bigint symbol',
);

/* ------------------------------------------------------------------ *
 * The C family and its relatives
 * ------------------------------------------------------------------ */

const C_KEYWORDS =
  'auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while _Alignas _Alignof _Atomic _Generic _Noreturn _Static_assert _Thread_local';
const C_TYPES =
  'char double float int long short signed unsigned void bool _Bool _Complex size_t ssize_t ptrdiff_t intptr_t uintptr_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t wchar_t FILE';

const c = cLike({ id: 'c', name: 'C', keywords: C_KEYWORDS, types: C_TYPES, literals: 'NULL true false', preprocessor: true, quotes: '"' });

const cpp = cLike({
  id: 'cpp',
  name: 'C++',
  keywords: `${C_KEYWORDS} alignas alignof and and_eq asm bitand bitor catch class compl concept consteval constexpr constinit const_cast co_await co_return co_yield decltype delete dynamic_cast explicit export friend mutable namespace new noexcept not not_eq operator or or_eq private protected public reinterpret_cast requires static_assert static_cast template thread_local throw try typeid typename using virtual xor xor_eq override final`,
  types: `${C_TYPES} char8_t char16_t char32_t std string vector map set unique_ptr shared_ptr`,
  literals: 'true false nullptr this NULL',
  preprocessor: true,
  quotes: '"',
});

const csharp = cLike({
  id: 'csharp',
  name: 'C#',
  keywords:
    'abstract as base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch throw try typeof unchecked unsafe using virtual volatile while add alias ascending async await by descending dynamic equals from get global group init into join let nameof notnull on orderby partial record remove required select set unmanaged value var when where with yield file scoped',
  types: 'bool byte char decimal double float int long object sbyte short string uint ulong ushort void nint nuint',
  literals: 'true false null this base',
  preprocessor: true,
  capitals: true,
  quotes: '"',
  before: [
    { match: /"""/, token: 'string', push: 'raw' },
    { match: /\$?@"|@\$"/, token: 'string', push: 'verbatim' },
    { match: /\$"/, token: 'string', push: 'interpolated' },
    { match: /\[[A-Z]\w*(?:\(.*?\))?\]/, token: 'meta' },
  ],
  states: {
    raw: { token: 'string', rules: [{ match: /"""/, token: 'string', pop: true }] },
    verbatim: stringState(/"/, { escape: false, multiline: true, doubled: '""', interpolation: /\{[^}"]*\}/ }),
    interpolated: stringState(/"/, { interpolation: /\{[^}"]*\}/ }),
  },
});

const java = cLike({
  id: 'java',
  name: 'Java',
  keywords:
    'abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized throw throws transient try volatile while var record yield sealed permits module requires exports opens',
  types: 'boolean byte char double float int long short void',
  literals: 'true false null this super',
  annotations: true,
  capitals: true,
  quotes: '"',
  before: [{ match: /"""/, token: 'string', push: 'block' }],
  states: { block: { token: 'string', rules: [{ match: /\\./, token: 'escape' }, { match: /"""/, token: 'string', pop: true }] } },
});

const kotlin = cLike({
  id: 'kotlin',
  name: 'Kotlin',
  keywords:
    'as break class continue do else for fun if in interface is object package return super throw try typealias typeof val var when while by catch constructor delegate dynamic field file finally get import init param property receiver set setparam where actual abstract annotation companion const crossinline data enum expect external final infix inline inner internal lateinit noinline open operator out override private protected public reified sealed suspend tailrec vararg value',
  literals: 'true false null this',
  annotations: true,
  capitals: true,
  quotes: '"',
  interpolation: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u,
  before: [{ match: /"""/, token: 'string', push: 'raw' }],
  states: { raw: { token: 'string', rules: [{ match: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' }, { match: /"""/, token: 'string', pop: true }] } },
});

const scala = cLike({
  id: 'scala',
  name: 'Scala',
  keywords:
    'abstract case catch class def do else extends final finally for forSome if implicit import lazy match new object override package private protected return sealed super throw trait try type val var while with yield given using enum export then end derives extension inline opaque transparent',
  literals: 'true false null this',
  annotations: true,
  capitals: true,
  quotes: '"',
  interpolation: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u,
  before: [{ match: /"""/, token: 'string', push: 'raw' }],
  states: { raw: { token: 'string', rules: [{ match: /"""/, token: 'string', pop: true }] } },
});

const groovy = cLike({
  id: 'groovy',
  name: 'Groovy',
  keywords:
    'abstract as assert break case catch class const continue def default do else enum extends final finally for goto if implements import in instanceof interface native new package private protected public return static strictfp super switch synchronized throw throws trait transient try var volatile while',
  types: 'boolean byte char double float int long short void',
  literals: 'true false null this super',
  annotations: true,
  capitals: true,
  interpolation: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_.]*/u,
  before: [
    { match: /"""/, token: 'string', push: 'dq3' },
    { match: /'''/, token: 'string', push: 'sq3' },
  ],
  states: {
    dq3: { token: 'string', rules: [{ match: /\$\{[^}]*\}/, token: 'variable' }, { match: /"""/, token: 'string', pop: true }] },
    sq3: { token: 'string', rules: [{ match: /'''/, token: 'string', pop: true }] },
  },
});

const dart = cLike({
  id: 'dart',
  name: 'Dart',
  keywords:
    'abstract as assert async await base break case catch class const continue covariant default deferred do dynamic else enum export extends extension external factory final finally for get hide if implements import in interface is late library mixin new on operator part required rethrow return sealed set show static switch sync throw try typedef var when while with yield',
  types: 'int double num bool void Never Object Function',
  literals: 'true false null this super',
  annotations: true,
  capitals: true,
  interpolation: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u,
  before: [
    { match: /r?"""/, token: 'string', push: 'dq3' },
    { match: /r?'''/, token: 'string', push: 'sq3' },
  ],
  states: {
    dq3: { token: 'string', rules: [{ match: /\$\{[^}]*\}/, token: 'variable' }, { match: /"""/, token: 'string', pop: true }] },
    sq3: { token: 'string', rules: [{ match: /\$\{[^}]*\}/, token: 'variable' }, { match: /'''/, token: 'string', pop: true }] },
  },
});

const go = cLike({
  id: 'go',
  name: 'Go',
  keywords: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var',
  types: 'bool byte complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr any comparable',
  literals: 'true false nil iota',
  builtins: 'append cap close complex copy delete imag len make new panic print println real recover min max clear',
  quotes: '"',
  before: [{ match: /`/, token: 'string', push: 'raw' }],
  states: { raw: { token: 'string', rules: [{ match: /`/, token: 'string', pop: true }] } },
});

const rust = cLike({
  id: 'rust',
  name: 'Rust',
  keywords:
    'as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return static struct super trait type unsafe use where while yield macro_rules union',
  types: 'bool char f32 f64 i8 i16 i32 i64 i128 isize str u8 u16 u32 u64 u128 usize',
  literals: 'true false self Self None Some Ok Err',
  capitals: true,
  quotes: '"',
  multilineStrings: true,
  before: [
    { match: /#!?\[[^\]]*\]/, token: 'meta' },
    { match: /b?r#*"/, token: 'string', push: 'raw' },
    { match: /b?'(?:\\(?:x[\da-fA-F]{2}|u\{[\da-fA-F]+\}|.)|[^\\'])'/, token: 'string' },
    { match: /'[\p{L}_][\p{L}\p{N}_]*/u, token: 'meta' },
    { match: /[\p{L}_][\p{L}\p{N}_]*!(?=\s*[([{])/u, token: 'function' },
  ],
  states: { raw: { token: 'string', rules: [{ match: /"#*/, token: 'string', pop: true }] } },
});

const swift = cLike({
  id: 'swift',
  name: 'Swift',
  keywords:
    'associatedtype class deinit enum extension fileprivate func import init inout internal let open operator private precedencegroup protocol public rethrows static struct subscript typealias var break case catch continue default defer do else fallthrough for guard if in repeat return throw switch where while as is try await async throws some any actor nonisolated isolated mutating nonmutating override required convenience final lazy weak unowned dynamic indirect optional get set willSet didSet macro consume',
  literals: 'true false nil self Self super',
  annotations: true,
  capitals: true,
  quotes: '"',
  interpolation: /\\\([^)]*\)/,
  before: [
    { match: /"""/, token: 'string', push: 'raw' },
    { match: /#[a-zA-Z]+/, token: 'meta' },
  ],
  states: { raw: { token: 'string', rules: [{ match: /\\\([^)]*\)/, token: 'variable' }, { match: /\\./, token: 'escape' }, { match: /"""/, token: 'string', pop: true }] } },
});

const objc = cLike({
  id: 'objc',
  name: 'Objective-C',
  keywords: `${C_KEYWORDS} in out inout bycopy byref oneway self super`,
  types: `${C_TYPES} id BOOL SEL IMP Class instancetype NSInteger NSUInteger CGFloat`,
  literals: 'YES NO nil Nil NULL true false',
  preprocessor: true,
  capitals: true,
  quotes: '"',
  before: [
    { match: /@"/, token: 'string', push: 'q34' },
    { match: /@[a-zA-Z]+/, token: 'keyword' },
  ],
});

const php = cLike({
  id: 'php',
  name: 'PHP',
  keywords:
    'abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile enum eval exit extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new or print private protected public readonly require require_once return static switch throw trait try unset use var while xor yield',
  types: 'int float bool string void mixed never object iterable',
  literals: 'true false null TRUE FALSE NULL self parent this',
  hashComments: true,
  capitals: true,
  multilineStrings: true,
  interpolation: /\{\$[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u,
  before: [
    { match: /<\?(?:php|=)?|\?>/, token: 'meta' },
    { match: /\$[\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' },
    { match: /#\[[^\]]*\]/, token: 'meta' },
  ],
});

const protobuf = cLike({
  id: 'protobuf',
  name: 'Protocol Buffers',
  keywords: 'syntax edition import weak public package option message enum service rpc returns stream oneof map reserved extensions extend optional required repeated to max group',
  types: 'double float int32 int64 uint32 uint64 sint32 sint64 fixed32 fixed64 sfixed32 sfixed64 bool string bytes',
  literals: 'true false',
  capitals: true,
});

/* ------------------------------------------------------------------ *
 * Languages with # comments
 * ------------------------------------------------------------------ */

const python: Grammar = {
  id: 'python',
  name: 'Python',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment' },
        { match: /[rRbBuUfF]{0,2}"""/, token: 'string', push: 'dq3' },
        { match: /[rRbBuUfF]{0,2}'''/, token: 'string', push: 'sq3' },
        { match: /[rRbBuUfF]{0,2}"/, token: 'string', push: 'dq' },
        { match: /[rRbBuUfF]{0,2}'/, token: 'string', push: 'sq' },
        { match: /@[\p{L}_][\p{L}\p{N}_.]*/u, token: 'meta', bol: true },
        NUMBER,
        ident({
          keyword: set(
            'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case',
          ),
          literal: set('True False None self cls NotImplemented Ellipsis __name__ __file__'),
          builtin: set(
            'print len range str int float bool list dict set tuple frozenset bytes bytearray open isinstance issubclass super enumerate zip map filter sorted reversed min max sum abs any all iter next repr type object getattr setattr hasattr delattr callable vars dir id hash input format round divmod pow chr ord hex oct bin staticmethod classmethod property',
          ),
          calls: true,
          capitals: true,
        }),
      ],
    },
    dq3: { token: 'string', rules: [{ match: /\\./, token: 'escape' }, { match: /"""/, token: 'string', pop: true }] },
    sq3: { token: 'string', rules: [{ match: /\\./, token: 'escape' }, { match: /'''/, token: 'string', pop: true }] },
    dq: stringState(/"/, { interpolation: /\{[^{}"]*\}/ }),
    sq: stringState(/'/, { interpolation: /\{[^{}']*\}/ }),
  },
};

const ruby: Grammar = {
  id: 'ruby',
  name: 'Ruby',
  states: {
    root: {
      rules: [
        { match: /=begin\b.*/, token: 'comment', bol: true, push: 'doc' },
        { match: /#.*/, token: 'comment' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /`/, token: 'string', push: 'bq' },
        { match: /:(?!:)[\p{L}_][\p{L}\p{N}_]*[?!=]?/u, token: 'literal' },
        { match: /@@?[\p{L}_][\p{L}\p{N}_]*|\$[\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' },
        { match: /\/(?![\s/])(?:\\.|[^/\\])+\/[imxounse]*/, token: 'regex', regex: true },
        NUMBER,
        ident(
          {
            keyword: set(
              'BEGIN END alias and begin break case class def defined? do else elsif end ensure for if in module next not or redo rescue retry return super then undef unless until when while yield require require_relative include extend prepend attr_accessor attr_reader attr_writer private protected public raise lambda proc loop puts',
            ),
            literal: set('true false nil self __FILE__ __LINE__ __method__'),
            capitals: true,
          },
          /[\p{L}_][\p{L}\p{N}_]*[?!]?/u,
        ),
      ],
    },
    doc: { token: 'comment', rules: [{ match: /=end\b.*/, token: 'comment', bol: true, pop: true }] },
    dq: stringState(/"/, { multiline: true, interpolation: /#\{[^}]*\}/ }),
    sq: stringState(/'/, { multiline: true }),
    bq: stringState(/`/, { multiline: true, interpolation: /#\{[^}]*\}/ }),
  },
};

const SHELL_VARIABLE = /\$(?:\{[^}]*\}|\(\(?|[\p{L}_][\p{L}\p{N}_]*|[@*#?$!0-9-])/u;

const shell: Grammar = {
  id: 'shell',
  name: 'Shell',
  states: {
    root: {
      rules: [
        { match: /(?<![^\s;|&(])#.*/, token: 'comment' },
        { match: /\$'/, token: 'string', push: 'ansi' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /`/, token: 'string', push: 'bq' },
        { match: SHELL_VARIABLE, token: 'variable' },
        { match: /\b\d+\b/, token: 'number' },
        ident(
          {
            keyword: set(
              'if then else elif fi case esac for select while until do done in function time coproc return exit break continue local export readonly declare typeset unset shift source alias set trap eval exec',
            ),
            builtin: set('echo printf read cd pwd test true false pushd popd mkdir rm cp mv ls cat grep sed awk find xargs sudo chmod chown curl git npm node'),
          },
          /[\p{L}_][\p{L}\p{N}_-]*/u,
        ),
      ],
    },
    dq: stringState(/"/, { multiline: true, interpolation: SHELL_VARIABLE }),
    sq: stringState(/'/, { multiline: true, escape: false }),
    ansi: stringState(/'/, { multiline: true }),
    bq: stringState(/`/, { multiline: true, interpolation: SHELL_VARIABLE }),
  },
};

const powershell: Grammar = {
  id: 'powershell',
  name: 'PowerShell',
  states: {
    root: {
      rules: [
        { match: /<#/, token: 'comment', push: 'block' },
        { match: /#.*/, token: 'comment' },
        { match: /@"/, token: 'string', push: 'here' },
        { match: /@'/, token: 'string', push: 'hereLiteral' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /\$(?:\{[^}]*\}|[\p{L}_][\p{L}\p{N}_]*(?::[\p{L}_][\p{L}\p{N}_]*)?|[$?^_])/u, token: 'variable' },
        { match: /\[[\p{L}_][\p{L}\p{N}_.[\]]*\]/u, token: 'type' },
        {
          match: /-[a-zA-Z]+\b/,
          words: {
            keyword: set('-eq -ne -gt -ge -lt -le -like -notlike -match -notmatch -cmatch -imatch -contains -notcontains -in -notin -replace -split -join -and -or -not -xor -is -isnot -as -band -bor -bxor -f'),
            ignoreCase: true,
          },
          token: 'attr',
        },
        { match: /[A-Z][a-z]+-[A-Z][\p{L}\p{N}]*/u, token: 'function' },
        NUMBER,
        ident({
          keyword: set(
            'begin break catch class continue data define do dynamicparam else elseif end enum exit filter finally for foreach from function hidden if in inlinescript param process return static switch throw trap try until using var while workflow parallel sequence',
          ),
          literal: set('$true $false $null'),
          ignoreCase: true,
        }),
      ],
    },
    block: commentState(/#>/),
    here: { token: 'string', rules: [{ match: /^"@/, token: 'string', pop: true }, { match: /\$[\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' }] },
    hereLiteral: { token: 'string', rules: [{ match: /^'@/, token: 'string', pop: true }] },
    dq: { token: 'string', rules: [{ match: /`./, token: 'escape' }, { match: /""/, token: 'escape' }, { match: /\$(?:\{[^}]*\}|[\p{L}_][\p{L}\p{N}_]*)/u, token: 'variable' }, { match: /"/, token: 'string', pop: true }] },
    sq: { token: 'string', rules: [{ match: /''/, token: 'escape' }, { match: /'/, token: 'string', pop: true }] },
  },
};

const batch: Grammar = {
  id: 'batch',
  name: 'Batch',
  states: {
    root: {
      rules: [
        { match: /@?(?:rem\b|::).*/i, token: 'comment', bol: true },
        { match: /:[\p{L}\p{N}_.-]+/u, token: 'function', bol: true },
        { match: /%%~?[a-zA-Z]|%~[a-zA-Z]*\d|%[^%\s]+%|%\d|![^!\s]+!/, token: 'variable' },
        { match: /"/, token: 'string', push: 'dq' },
        NUMBER,
        ident({
          keyword: set(
            'if else goto call set setlocal endlocal echo exit for in do not exist defined errorlevel equ neq lss leq gtr geq shift pushd popd cd chdir start pause cls title copy del move ren mkdir rmdir type choice',
          ),
          literal: set('on off nul con'),
          ignoreCase: true,
        }),
      ],
    },
    dq: stringState(/"/, { escape: false, interpolation: /%[^%\s"]+%|![^!\s"]+!/ }),
  },
};

const perl: Grammar = {
  id: 'perl',
  name: 'Perl',
  states: {
    root: {
      rules: [
        { match: /=[a-zA-Z]\w*.*/, token: 'comment', bol: true, push: 'pod' },
        { match: /#.*/, token: 'comment' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /[$@%]\{?\^?[\p{L}_][\p{L}\p{N}_:]*\}?|\$[^\p{L}\s{]/u, token: 'variable' },
        { match: /\/(?![\s/])(?:\\.|[^/\\])+\/[msixpodualngcer]*/, token: 'regex', regex: true },
        NUMBER,
        ident({
          keyword: set(
            'my our local state sub if elsif else unless while until for foreach do last next redo return use no require package BEGIN END and or not xor eq ne lt gt le ge cmp qw q qq qr m s tr y',
          ),
          builtin: set('print printf say die warn defined undef wantarray scalar ref bless shift unshift push pop splice keys values each exists delete split join map grep sort reverse open close chomp chop length substr index sprintf lc uc'),
          calls: true,
        }),
      ],
    },
    pod: { token: 'comment', rules: [{ match: /=cut\b.*/, token: 'comment', bol: true, pop: true }] },
    dq: stringState(/"/, { multiline: true, interpolation: /[$@][\p{L}_][\p{L}\p{N}_]*/u }),
    sq: stringState(/'/, { multiline: true }),
  },
};

const r: Grammar = {
  id: 'r',
  name: 'R',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /`[^`]*`/, token: 'variable' },
        NUMBER,
        ident(
          {
            keyword: set('if else repeat while function for in next break return switch library require'),
            literal: set('TRUE FALSE NULL NA Inf NaN NA_integer_ NA_real_ NA_character_ T F'),
            calls: true,
          },
          /[\p{L}.][\p{L}\p{N}_.]*/u,
        ),
      ],
    },
    dq: stringState(/"/, { multiline: true }),
    sq: stringState(/'/, { multiline: true }),
  },
};

const elixir: Grammar = {
  id: 'elixir',
  name: 'Elixir',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment' },
        { match: /"""/, token: 'string', push: 'heredoc' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /:(?!:)[\p{L}_][\p{L}\p{N}_]*[?!]?/u, token: 'literal' },
        { match: /@[\p{L}_][\p{L}\p{N}_]*/u, token: 'meta' },
        NUMBER,
        ident(
          {
            keyword: set(
              'def defp defmodule defmacro defmacrop defstruct defprotocol defimpl defexception defdelegate defguard do end fn when if else unless case cond with for receive try catch rescue after raise import require alias use quote unquote and or not in',
            ),
            literal: set('true false nil'),
            calls: true,
            capitals: true,
          },
          /[\p{L}_][\p{L}\p{N}_]*[?!]?/u,
        ),
      ],
    },
    heredoc: { token: 'string', rules: [{ match: /#\{[^}]*\}/, token: 'variable' }, { match: /"""/, token: 'string', pop: true }] },
    dq: stringState(/"/, { multiline: true, interpolation: /#\{[^}]*\}/ }),
    sq: stringState(/'/, { multiline: true }),
  },
};

const graphql: Grammar = {
  id: 'graphql',
  name: 'GraphQL',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment' },
        { match: /"""/, token: 'string', push: 'block' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /\$[\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' },
        { match: /@[\p{L}_][\p{L}\p{N}_]*/u, token: 'meta' },
        NUMBER,
        ident({
          keyword: set('query mutation subscription fragment on type interface union enum input scalar schema extend implements directive repeatable'),
          literal: set('true false null'),
          capitals: true,
        }),
      ],
    },
    block: { token: 'string', rules: [{ match: /"""/, token: 'string', pop: true }] },
    dq: stringState(/"/),
  },
};

/* ------------------------------------------------------------------ *
 * Languages with -- comments, and others of their own
 * ------------------------------------------------------------------ */

const SQL_KEYWORDS =
  'select from where and or not in is null like between exists as on join inner left right full outer cross natural using group by order having limit offset fetch first next rows only union all intersect except distinct insert into values update set delete merge create alter drop truncate table view index unique primary key foreign references constraint check default database schema if replace temporary temp procedure function trigger begin end declare return returns case when then else with recursive grant revoke commit rollback transaction savepoint asc desc nulls cascade restrict auto_increment identity sequence over partition window lateral returning conflict do nothing exec execute go top while loop for each row language';

const sql: Grammar = {
  id: 'sql',
  name: 'SQL',
  states: {
    root: {
      rules: [
        { match: /--.*/, token: 'comment' },
        { match: /\/\*/, token: 'comment', push: 'comment' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /"(?:""|[^"]){0,200}"|`[^`]{0,200}`|\[[^\]\n]{0,200}\]/, token: 'property' },
        { match: /[@:][\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' },
        NUMBER,
        ident({
          keyword: set(SQL_KEYWORDS),
          type: set(
            'int integer bigint smallint tinyint decimal numeric float real double precision char varchar nchar nvarchar text ntext date time timestamp timestamptz datetime datetime2 interval boolean bool bit blob clob binary varbinary uuid json jsonb xml serial bigserial money',
          ),
          literal: set('null true false'),
          calls: true,
          ignoreCase: true,
        }),
      ],
    },
    comment: commentState(/\*\//),
    sq: stringState(/'/, { escape: false, multiline: true, doubled: "''" }),
  },
};

const lua: Grammar = {
  id: 'lua',
  name: 'Lua',
  states: {
    root: {
      rules: [
        { match: /--\[(=*)\[/, token: 'comment', push: 'block' },
        { match: /--.*/, token: 'comment' },
        { match: /\[(=*)\[/, token: 'string', push: 'long' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        NUMBER,
        ident({
          keyword: set('and break do else elseif end for function goto if in local not or repeat return then until while'),
          literal: set('true false nil self'),
          builtin: set('print pairs ipairs require type tostring tonumber setmetatable getmetatable error assert pcall xpcall select next rawget rawset unpack'),
          calls: true,
        }),
      ],
    },
    block: commentState(/\]=*\]/),
    long: { token: 'string', rules: [{ match: /\]=*\]/, token: 'string', pop: true }] },
    dq: stringState(/"/),
    sq: stringState(/'/),
  },
};

const haskell: Grammar = {
  id: 'haskell',
  name: 'Haskell',
  states: {
    root: {
      rules: [
        { match: /\{-/, token: 'comment', push: 'block' },
        { match: /--(?![!#$%&*+./<=>?@\\^|~:]).*/, token: 'comment' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'(?:\\.|[^\\'])'/, token: 'string' },
        NUMBER,
        ident(
          {
            keyword: set(
              'case class data default deriving do else foreign if import in infix infixl infixr instance let module newtype of then type where qualified as hiding forall mdo family role pattern',
            ),
            literal: set('True False Nothing'),
            capitals: true,
          },
          /[\p{L}_][\p{L}\p{N}_']*/u,
        ),
      ],
    },
    block: commentState(/-\}/),
    dq: stringState(/"/),
  },
};

const pascal: Grammar = {
  id: 'pascal',
  name: 'Pascal',
  states: {
    root: {
      rules: [
        { match: /\{\$[^}]*\}|\(\*\$.*?\*\)/, token: 'meta' },
        { match: /\{/, token: 'comment', push: 'brace' },
        { match: /\(\*/, token: 'comment', push: 'paren' },
        { match: /\/\/.*/, token: 'comment' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /#\$?[\da-fA-F]+/, token: 'string' },
        { match: /\$[\da-fA-F]+/, token: 'number' },
        NUMBER,
        ident({
          keyword: set(
            'and array as asm begin case class const constructor destructor div do downto else end except exports file finalization finally for function goto if implementation in inherited initialization inline interface is label library mod not object of on or out packed procedure program property raise record repeat resourcestring set shl shr then threadvar to try type unit until uses var while with xor private protected public published strict override virtual abstract overload reintroduce default read write stored forward external',
          ),
          type: set('integer cardinal boolean char byte word longint longword int64 uint64 shortint smallint real double single extended currency string ansistring widestring unicodestring pchar pointer variant tobject'),
          literal: set('true false nil self result'),
          ignoreCase: true,
        }),
      ],
    },
    brace: commentState(/\}/),
    paren: commentState(/\*\)/),
    sq: stringState(/'/, { escape: false, doubled: "''" }),
  },
};

const vb: Grammar = {
  id: 'vb',
  name: 'Visual Basic',
  states: {
    root: {
      rules: [
        { match: /'.*/, token: 'comment' },
        { match: /rem\b.*/i, token: 'comment', bol: true },
        { match: /#\s*[a-zA-Z]+/, token: 'meta', bol: true },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /#[\d/: apmAPM-]+#/, token: 'number' },
        { match: /&[hH][\da-fA-F]+|&[oO][0-7]+/, token: 'number' },
        NUMBER,
        ident({
          keyword: set(
            'addhandler addressof alias and andalso as byref byval call case catch class const continue declare default delegate dim directcast do each else elseif end endif enum erase error event exit finally for friend function get gettype global gosub goto handles if implements imports in inherits interface is isnot let lib like loop me mod module mustinherit mustoverride mybase myclass namespace narrowing new next not notinheritable notoverridable of on operator option optional or orelse overloads overridable overrides paramarray partial private property protected public raiseevent readonly redim removehandler resume return select set shadows shared static step stop structure sub synclock then throw to try trycast typeof using wend when while widening with withevents writeonly xor',
          ),
          type: set('boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort variant currency'),
          literal: set('true false nothing null empty'),
          ignoreCase: true,
        }),
      ],
    },
    dq: stringState(/"/, { escape: false, doubled: '""' }),
  },
};

/* ------------------------------------------------------------------ *
 * Markup, styles and data
 * ------------------------------------------------------------------ */

/**
 * The patterns below spell `<!-{2}` and `scrip[t]` so that the bundle, inlined
 * into the page's own script element, never holds the characters that would change
 * how the HTML parser reads it (build.mjs checks).
 */
function markup(id: string, name: string, embedded: boolean): Grammar {
  const attributes: RuleSpec[] = [
    { match: /[^\s/>"'=]+/, token: 'attr' },
    { match: /"/, token: 'string', push: 'dqa' },
    { match: /'/, token: 'string', push: 'sqa' },
  ];
  const states: Record<string, StateSpec> = {
    root: {
      rules: [
        { match: /<!-{2}/, token: 'comment', push: 'comment' },
        { match: /<!\[CDATA\[/, token: 'meta', push: 'cdata' },
        { match: /<![a-zA-Z][^>]*>?/, token: 'meta' },
        { match: /<\?[\s\S]*?(?:\?>|$)/, token: 'meta' },
        ...(embedded
          ? [
              { match: /<scrip[t]\b/i, token: 'tag', push: 'scriptTag' } as RuleSpec,
              { match: /<style\b/i, token: 'tag', push: 'styleTag' } as RuleSpec,
            ]
          : []),
        { match: /<\/?[\p{L}_][\p{L}\p{N}_:.-]*/u, token: 'tag', push: 'tag' },
        { match: /&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z][a-zA-Z\d]*);/, token: 'escape' },
      ],
    },
    tag: { rules: [{ match: /\/?>/, token: 'tag', pop: true }, ...attributes] },
    comment: commentState(/-->/),
    cdata: { token: 'string', rules: [{ match: /\]\]>/, token: 'meta', pop: true }] },
    dqa: { token: 'string', rules: [{ match: /"/, token: 'string', pop: true }] },
    sqa: { token: 'string', rules: [{ match: /'/, token: 'string', pop: true }] },
  };
  if (embedded) {
    states['scriptTag'] = { rules: [{ match: /\/>/, token: 'tag', pop: true }, { match: />/, token: 'tag', next: 'js:root' }, ...attributes] };
    states['styleTag'] = { rules: [{ match: /\/>/, token: 'tag', pop: true }, { match: />/, token: 'tag', next: 'css:root' }, ...attributes] };
    embed(states, javascript, 'js:', /(?=<\/scrip[t]\b)/i);
    embed(states, css, 'css:', /(?=<\/style\b)/i);
  }
  return { id, name, states };
}

function styles(id: string, name: string, lineComments: boolean): Grammar {
  const common: RuleSpec[] = [
    { match: /\/\*/, token: 'comment', push: 'comment' },
    ...(lineComments ? [{ match: /\/\/.*/, token: 'comment' } as RuleSpec] : []),
    { match: /"/, token: 'string', push: 'dq' },
    { match: /'/, token: 'string', push: 'sq' },
    { match: /url\([^)]*\)/, token: 'string' },
    { match: /@[\w-]+/, token: 'keyword' },
    { match: /\$[\w-]+|--[\w-]+/, token: 'variable' },
    { match: /#\{[^}]*\}/, token: 'variable' },
  ];
  return {
    id,
    name,
    states: {
      root: {
        rules: [
          ...common,
          { match: /\{/, push: 'block' },
          { match: /[.#][\w-]+/, token: 'selector' },
          { match: /::?[\w-]+/, token: 'meta' },
          { match: /\[[^\]]{0,200}\]/, token: 'attr' },
          { match: /&/, token: 'selector' },
          { match: /[a-zA-Z][\w-]*/, token: 'tag' },
        ],
      },
      block: {
        rules: [
          ...common,
          { match: /\{/, push: 'block' },
          { match: /\}/, pop: true },
          { match: /[\w-]+(?=\s*:(?!:))/, token: 'property' },
          { match: /#[\da-fA-F]{3,8}\b/, token: 'number' },
          { match: /!important\b/, token: 'keyword' },
          { match: /-?(?:\d+\.?\d*|\.\d+)(?:[a-zA-Z]+|%)?/, token: 'number' },
          { match: /[\w-]+(?=\()/, token: 'function' },
          { match: /[.#&][\w-]+|::?[\w-]+/, token: 'selector' },
          { match: /[a-zA-Z][\w-]*/, token: 'literal' },
        ],
      },
      comment: commentState(/\*\//),
      dq: stringState(/"/),
      sq: stringState(/'/),
    },
  };
}

const css = styles('css', 'CSS', false);
const scss = styles('scss', 'SCSS', true);
const less = styles('less', 'Less', true);
const html = markup('html', 'HTML', true);
const xml = markup('xml', 'XML', false);

const json: Grammar = {
  id: 'json',
  name: 'JSON',
  states: {
    root: {
      rules: [
        { match: /\/\/.*/, token: 'comment' },
        { match: /\/\*/, token: 'comment', push: 'comment' },
        { match: /"(?:\\.|[^"\\])*"(?=\s*:)/, token: 'property' },
        { match: /"(?:\\.|[^"\\])*"?/, token: 'string' },
        { match: /-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/, token: 'number' },
        ident({ literal: set('true false null NaN Infinity') }),
      ],
    },
    comment: commentState(/\*\//),
  },
};

const yaml: Grammar = {
  id: 'yaml',
  name: 'YAML',
  states: {
    root: {
      rules: [
        { match: /(?<![^\s])#.*/, token: 'comment' },
        { match: /(?:---|\.\.\.)(?=\s|$)/, token: 'meta', bol: true },
        { match: /%[A-Z]+.*/, token: 'meta', bol: true },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        // Bounded: tried at every token, an unbounded scan to the end of a long line would be quadratic.
        { match: /[^\s#:'"[\]{},&*!|>-][^#:]{0,120}?(?=\s*:(?:\s|$))/, token: 'property' },
        { match: /[&*][^\s[\]{},]+/, token: 'variable' },
        { match: /!!?[^\s[\]{},]*/, token: 'meta' },
        { match: /[-+]?(?:\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?|\.inf|\.nan)(?=\s*(?:#|$|,|\]|\}))/, token: 'number' },
        ident({ literal: set('true false yes no on off null ~ True False Yes No On Off Null TRUE FALSE NULL') }),
      ],
    },
    dq: stringState(/"/, { multiline: true }),
    sq: stringState(/'/, { escape: false, multiline: true, doubled: "''" }),
  },
};

const toml: Grammar = {
  id: 'toml',
  name: 'TOML',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment' },
        { match: /\[\[?[^\]\n]*\]\]?/, token: 'section', bol: true },
        { match: /[\w."'-]+(?=\s*=)/, token: 'property', bol: true },
        { match: /"""/, token: 'string', push: 'dq3' },
        { match: /'''/, token: 'string', push: 'sq3' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /\d{4}-\d\d-\d\d(?:[T ]\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)?)?|\d\d:\d\d:\d\d(?:\.\d+)?/, token: 'number' },
        NUMBER,
        ident({ literal: set('true false inf nan') }),
      ],
    },
    dq3: { token: 'string', rules: [{ match: /\\./, token: 'escape' }, { match: /"""/, token: 'string', pop: true }] },
    sq3: { token: 'string', rules: [{ match: /'''/, token: 'string', pop: true }] },
    dq: stringState(/"/),
    sq: stringState(/'/, { escape: false }),
  },
};

const ini: Grammar = {
  id: 'ini',
  name: 'INI',
  states: {
    root: {
      rules: [
        { match: /[;#!].*/, token: 'comment', bol: true },
        { match: /\[[^\]\n]*\]/, token: 'section', bol: true },
        { match: /(?:export\s+)?[^=:\s[][^=:]*?(?=\s*[=:])/, token: 'property', bol: true },
        { match: /"(?:\\.|[^"\\])*"?|'[^']*'?/, token: 'string' },
        { match: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*|%\(?[\w.]+\)?[sd%]?/u, token: 'variable' },
        { match: /-?\b\d+(?:\.\d+)?\b/, token: 'number' },
        ident({ literal: set('true false yes no on off null none'), ignoreCase: true }),
      ],
    },
  },
};

/** .gitignore and the like: comments and patterns. */
const ignore: Grammar = {
  id: 'ignore',
  name: 'Ignore file',
  states: { root: { rules: [{ match: /#.*/, token: 'comment', bol: true }, { match: /!/, token: 'keyword', bol: true }] } },
};

const markdown: Grammar = {
  id: 'markdown',
  name: 'Markdown',
  states: {
    root: {
      rules: [
        { match: /(?:```|~~~).*/, token: 'code', bol: true, push: 'fence' },
        { match: /#{1,6}(?=\s|$).*/, token: 'heading', bol: true },
        { match: /(?:[-*_][ \t]*){3,}$/, token: 'meta', bol: true },
        { match: /(?:[-*+]|\d+[.)])(?=\s)/, token: 'keyword', bol: true },
        { match: />+/, token: 'meta', bol: true },
        { match: /<!-{2}/, token: 'comment', push: 'comment' },
        // The lengths are bounded for the same reason as YAML's keys: these are tried at every token.
        { match: /`+[^`]{0,400}`+/, token: 'code' },
        { match: /\*\*(?=\S)[^*]{0,400}\*\*|__(?=\S)[^_]{0,400}__/, token: 'strong' },
        { match: /\*(?=[^\s*])[^*]{0,400}\*|(?<![\p{L}\p{N}])_(?=[^\s_])[^_]{0,400}_(?![\p{L}\p{N}])/u, token: 'emphasis' },
        { match: /!?\[[^\]]{0,400}\](?:\([^)]{0,400}\)|\[[^\]]{0,400}\])/, token: 'link' },
        { match: /<https?:[^>]+>|https?:\/\/[^\s)>\]]+/, token: 'link' },
        { match: /<\/?[a-zA-Z][^>]*>/, token: 'tag' },
        { match: /\\./, token: 'escape' },
      ],
    },
    fence: { token: 'code', rules: [{ match: /(?:```|~~~)\s*$/, token: 'code', bol: true, pop: true }] },
    comment: commentState(/-->/),
  },
};

const diff: Grammar = {
  id: 'diff',
  name: 'Diff',
  states: {
    root: {
      rules: [
        { match: /(?:\+\+\+|---)(?: .*|$)/, token: 'heading', bol: true },
        { match: /@@.*/, token: 'meta', bol: true },
        { match: /\+.*/, token: 'inserted', bol: true },
        { match: /-.*/, token: 'deleted', bol: true },
        { match: /(?:diff|index|new file|deleted file|similarity|rename|old mode|new mode|Binary|Only in)\b.*/, token: 'comment', bol: true },
      ],
    },
  },
};

const dockerfile: Grammar = {
  id: 'dockerfile',
  name: 'Dockerfile',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment', bol: true },
        { match: /(?:FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/i, token: 'keyword', bol: true },
        { match: /\bAS\b/i, token: 'keyword' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /'/, token: 'string', push: 'sq' },
        { match: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u, token: 'variable' },
        { match: /--[\w-]+/, token: 'attr' },
        { match: /\b\d+\b/, token: 'number' },
      ],
    },
    dq: stringState(/"/, { interpolation: /\$\{[^}]*\}|\$[\p{L}_][\p{L}\p{N}_]*/u }),
    sq: stringState(/'/, { escape: false }),
  },
};

const makefile: Grammar = {
  id: 'makefile',
  name: 'Makefile',
  states: {
    root: {
      rules: [
        { match: /#.*/, token: 'comment' },
        { match: /-?(?:include|sinclude|ifeq|ifneq|ifdef|ifndef|else|endif|define|endef|export|unexport|override|vpath|private)\b/, token: 'keyword', bol: true },
        { match: /\$(?:\([^)]*\)|\{[^}]*\}|[@<^?*%+|])/, token: 'variable' },
        { match: /[\w.-]+(?=\s*(?:[:+?!]?=))/, token: 'property', bol: true },
        { match: /[^\s:=#$][^:=#$]*?(?=\s*::?(?!=))/, token: 'function', bol: true },
        { match: /"(?:\\.|[^"\\])*"|'[^']*'/, token: 'string' },
      ],
    },
  },
};

const cmake: Grammar = {
  id: 'cmake',
  name: 'CMake',
  states: {
    root: {
      rules: [
        { match: /#\[(=*)\[/, token: 'comment', push: 'block' },
        { match: /#.*/, token: 'comment' },
        { match: /"/, token: 'string', push: 'dq' },
        { match: /\$(?:ENV|CACHE)?\{[^}]*\}/, token: 'variable' },
        NUMBER,
        ident({ literal: set('ON OFF TRUE FALSE YES NO'), calls: true }),
      ],
    },
    block: commentState(/\]=*\]/),
    dq: stringState(/"/, { multiline: true, interpolation: /\$\{[^}]*\}/ }),
  },
};

const plain: Grammar = { id: 'plain', name: 'Plain text', states: { root: { rules: [] } } };

/* ------------------------------------------------------------------ *
 * Which language a file is in
 * ------------------------------------------------------------------ */

export const GRAMMARS: readonly Grammar[] = [
  plain,
  batch,
  c,
  cpp,
  csharp,
  cmake,
  css,
  dart,
  diff,
  dockerfile,
  elixir,
  go,
  graphql,
  groovy,
  haskell,
  html,
  ignore,
  ini,
  java,
  javascript,
  json,
  kotlin,
  less,
  lua,
  makefile,
  markdown,
  objc,
  pascal,
  perl,
  php,
  powershell,
  protobuf,
  python,
  r,
  ruby,
  rust,
  scala,
  scss,
  shell,
  sql,
  swift,
  toml,
  typescript,
  vb,
  xml,
  yaml,
];

const BY_ID = new Map(GRAMMARS.map((grammar) => [grammar.id, grammar]));

export function grammarById(id: string): Grammar | undefined {
  return BY_ID.get(id);
}

const EXTENSIONS: Record<string, string> = {};
const register = (id: string, list: string): void => {
  for (const ext of list.split(' ')) EXTENSIONS[ext] = id;
};
register('batch', 'bat cmd');
register('c', 'c h');
register('cpp', 'cpp cc cxx c++ hpp hh hxx h++ ino ipp inl tpp cu cuh');
register('csharp', 'cs csx cake');
register('cmake', 'cmake');
register('css', 'css');
register('dart', 'dart');
register('diff', 'diff patch rej');
register('dockerfile', 'dockerfile containerfile');
register('elixir', 'ex exs');
register('go', 'go');
register('graphql', 'graphql gql graphqls');
register('groovy', 'groovy gradle gvy gy gsh');
register('haskell', 'hs lhs');
register('html', 'html htm xhtml shtml vue svelte astro hbs handlebars ejs njk');
register('ini', 'ini cfg conf properties env editorconfig gitconfig gitmodules npmrc prettierrc desktop service reg inf');
register('java', 'java');
register('javascript', 'js mjs cjs jsx');
register('json', 'json jsonc json5 webmanifest har ipynb babelrc eslintrc jshintrc');
register('kotlin', 'kt kts');
register('less', 'less');
register('lua', 'lua');
register('makefile', 'mk mak make');
register('markdown', 'md markdown mdx mkd mdown');
register('objc', 'm mm');
register('pascal', 'pas pp dpr dpk lpr dfm lfm');
register('perl', 'pl pm t pod');
register('php', 'php phtml php3 php4 php5 phps');
register('powershell', 'ps1 psm1 psd1');
register('protobuf', 'proto');
register('python', 'py pyw pyi pyx gyp');
register('r', 'r rmd');
register('ruby', 'rb rake gemspec ru erb');
register('rust', 'rs');
register('scala', 'scala sc sbt');
register('scss', 'scss sass');
register('shell', 'sh bash zsh ksh fish command');
register('sql', 'sql ddl dml psql pgsql mysql');
register('swift', 'swift');
register('toml', 'toml');
register('typescript', 'ts mts cts tsx');
register('vb', 'vb vbs bas vba cls frm');
register('xml', 'xml svg xsd xsl xslt plist csproj vbproj fsproj vcxproj props targets nuspec resx xaml wsdl rss atom kml gpx config manifest storyboard xib');
register('yaml', 'yml yaml');

const NAMES: Record<string, string> = {
  dockerfile: 'dockerfile',
  containerfile: 'dockerfile',
  makefile: 'makefile',
  gnumakefile: 'makefile',
  'cmakelists.txt': 'cmake',
  gemfile: 'ruby',
  rakefile: 'ruby',
  podfile: 'ruby',
  vagrantfile: 'ruby',
  jenkinsfile: 'groovy',
  '.bashrc': 'shell',
  '.bash_profile': 'shell',
  '.zshrc': 'shell',
  '.profile': 'shell',
  '.env': 'ini',
  '.gitignore': 'ignore',
  '.dockerignore': 'ignore',
  '.npmignore': 'ignore',
  '.prettierignore': 'ignore',
  '.eslintignore': 'ignore',
  '.gitattributes': 'ignore',
  codeowners: 'ignore',
  'package-lock.json': 'json',
  'tsconfig.json': 'json',
};

/** The grammar for a file, by its name, then by its first line (a #! line, an XML declaration). */
export function detectGrammar(name: string, firstLine = ''): Grammar {
  const base = name.toLowerCase();
  const byName = NAMES[base] ?? (base.startsWith('.env.') ? 'ini' : base.startsWith('dockerfile.') ? 'dockerfile' : undefined);
  if (byName) return BY_ID.get(byName) as Grammar;
  const dot = base.lastIndexOf('.');
  const ext = dot >= 0 ? base.slice(dot + 1) : '';
  const byExtension = EXTENSIONS[ext];
  if (byExtension) return BY_ID.get(byExtension) as Grammar;
  const line = firstLine.trim();
  if (line.startsWith('#!')) {
    if (/\b(?:node|deno|bun)\b/.test(line)) return javascript;
    if (/python/.test(line)) return python;
    if (/ruby/.test(line)) return ruby;
    if (/perl/.test(line)) return perl;
    if (/php/.test(line)) return php;
    if (/pwsh|powershell/.test(line)) return powershell;
    if (/\b(?:ba|z|k|da|fi)?sh\b/.test(line)) return shell;
  }
  if (/^<\?xml\b/.test(line)) return xml;
  if (/^<!doctype html|^<html\b/i.test(line)) return html;
  return plain;
}
