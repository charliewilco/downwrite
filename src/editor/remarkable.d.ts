declare module "remarkable" {
  function isString(obj?: any): boolean;

  function has(object: any, key: string): boolean;

  function assign(target: any, ...sources: any[]): any;

  function unescapeMd(str: string): string;

  function isValidEntityCode(c: number): boolean;

  function fromCodePoint(c: number): string;

  function replaceEntities(str: string): string;

  function escapeHtml(str: string): string;

  export { Remarkable };

  export class Renderer {
    rules: Remarkable.Rules;

    /**
     * Exported helper, for custom rules only.
     */
    getBreak: Remarkable.GetBreak;

    /**
     * Render a string of inline HTML with the given `tokens` and
     * `options`.
     */
    renderInline(
      tokens: Remarkable.Token[],
      options: Remarkable.Options,
      env: Remarkable.Env
    ): string;

    /**
     * Render a string of HTML with the given `tokens` and
     * `options`.
     */
    render(
      tokens: Remarkable.Token[],
      options: Remarkable.Options,
      env: Remarkable.Env
    ): string;
  }

  export class Ruler<RULE> {
    /**
     * Replace the rule `ruleName` with a new rule.
     */
    at(ruleName: string, fn: RULE, options: Remarkable.Options): void;

    /**
     * Add a rule to the chain before given the `ruleName`.
     */
    before(
      beforeName: string,
      ruleName: string,
      fn: RULE,
      options: Remarkable.Options
    ): void;

    /**
     * Add a rule to the chain after the given `ruleName`.
     */
    after(
      afterName: string,
      ruleName: string,
      fn: RULE,
      options: Remarkable.Options
    ): void;

    /**
     * Add a rule to the end of chain.
     */
    push(ruleName: string, fn: RULE, options: Remarkable.Options): void;

    /**
     * Enable a rule or list of rules.
     *
     * @param list Name or array of rule names to enable.
     * @param strict If `true`, all non listed rules will be disabled.
     */
    enable(list: string | string[], strict?: boolean): void;

    /**
     * Disable a rule or list of rules.
     *
     * @param list Name or array of rule names to disable.
     */
    disable(list: string | string[]): void;

    /**
     * Get a rules list as an array of functions.
     */
    getRules(chainName: string): Remarkable.Rule[];
  }

  declare class Remarkable {
    /**
     * Useful helper functions for custom rendering.
     */
    static utils: typeof Utils;

    inline: { ruler: Ruler<Remarkable.InlineParsingRule> };

    block: { ruler: Ruler<Remarkable.BlockParsingRule> };

    core: { ruler: Ruler<Remarkable.CoreParsingRule> };

    renderer: Renderer;

    /**
     * Markdown parser, done right.
     */
    constructor(options?: Remarkable.Options);

    /**
     * Remarkable offers some "presets" as a convenience to quickly enable/disable
     * active syntax rules and options for common use cases.
     */
    constructor(
      preset: "commonmark" | "full" | "remarkable",
      options?: Remarkable.Options
    );

    /**
     * `"# Remarkable rulezz!"` => `"<h1>Remarkable rulezz!</h1>"`
     */
    render(markdown: string, env?: Remarkable.Env): string;

    /**
     * Define options.
     *
     * Note: To achieve the best possible performance, don't modify a Remarkable instance
     * on the fly. If you need multiple configurations, create multiple instances and
     * initialize each with a configuration that is ideal for that instance.
     */
    set(options: Remarkable.Options): void;

    /**
     * Use a plugin.
     */
    use(plugin: Remarkable.Plugin, options?: any): Remarkable;

    /**
     * Batch loader for components rules states, and options.
     */
    configure(presets: Remarkable.Presets): void;

    /**
     * Parse the input `string` and return a tokens array.
     * Modifies `env` with definitions data.
     */
    parse(str: string, env: Remarkable.Env): Remarkable.Token[];

    /**
     * Parse the given content `string` as a single string.
     */
    parseInline(str: string, env: Remarkable.Env): Remarkable.Token[];

    /**
     * Render a single content `string`, without wrapping it
     * to paragraphs.
     */
    renderInline(str: string, env?: Remarkable.Env): string;
  }

  declare namespace Remarkable {
    interface Env {
      [key: string]: any;
    }

    export type GetBreak = Rule<ContentToken, "" | "\n">;

    export interface Options {
      /**
       * Enable HTML tags in source.
       */
      html?: boolean;

      /**
       * Use "/" to close single tags (<br />).
       */
      xhtmlOut?: boolean;

      /**
       * Convert "\n" in paragraphs into <br>.
       */
      breaks?: boolean;

      /**
       * CSS language prefix for fenced blocks.
       */
      langPrefix?: string;

      /**
       * Autoconvert URL-like text to links.
       */
      linkify?: boolean;

      /**
       * Set target to open link in
       */
      linkTarget?: string;

      /**
       * Enable some language-neutral replacement + quotes beautification.
       */
      typographer?: boolean;

      /**
       * Double + single quotes replacement pairs, when typographer enabled,
       * and smartquotes on. Set doubles to "«»" for Russian, "„“" for German.
       */
      quotes?: string;

      /**
       * Highlighter function. Should return escaped HTML, or "" if the source
       * string is not changed.
       */
      highlight?(str: string, lang: string): string;
    }

    export type Plugin = (md: Remarkable, options?: any) => void;

    export interface Presets {
      components: {
        [name: string]: {
          rules: Rules;
        };
      };

      options: Options;
    }

    export interface StateBlock {
      src: string;
      /** Shortcuts to simplify nested calls */
      parser: ParserBlock;
      options: Options;
      env: Env;
      tokens: BlockContentToken[];
      bMarks: number[];
      eMarks: number[];
      tShift: number[];
      /** required block content indent */
      blkIndent: number;
      /** line index in src */
      line: number;
      /** lines count */
      lineMax: number;
      /** loose/tight mode for lists */
      tight: boolean;
      /** If `list`, block parser stops on two newlines */
      parentType: "root" | "list";
      /** Indent of the current dd block, -1 if there isn't any */
      ddIndent: number;
      level: number;
      result: string;
      isEmpty: (line: number) => boolean;
      skipEmptyLines: (from: number) => number;
      skipSpaces: (pos: number) => number;
      skipChars: (pos: number, code: number) => number;
      getLines: (
        begin: number,
        end: number,
        indent: number,
        keepLastLF: boolean
      ) => string;
    }
    interface StateInline {
      src: string;
      env: Env;
      parser: ParserInline;
      tokens: ContentToken[];
      pos: number;
      posMax: number;
      level: number;
      pending: string;
      pendingLevel: number;
      /** Set true when seek link label */
      isInLabel: boolean;
      /**
       * Increment for each nesting link.
       * Used to prevent nesting in definitions.
       */
      linkLevel: number;
      /**
       * Temporary storage for link url.
       */
      linkContent: string;

      /**
       * Track unpaired `[` for link labels.
       */
      labelUnmatchedScopes: number;
      push: (token: ContentToken) => void;
      pushPending: () => void;
    }

    /**
     * Return `true` if the parsing function has recognized the current position
     * in the input as one if its tokens.
     */
    type CoreParsingRule = (
      /**
       * Representation of the current input stream, and the results of
       * parsing it so far.
       */
      state: StateInline
    ) => boolean;

    /**
     * Return `true` if the parsing function has recognized the current position
     * in the input as one if its tokens.
     */
    type InlineParsingRule = (
      /**
       * Representation of the current input stream, and the results of
       * parsing it so far.
       */
      state: StateInline,

      /**
       * If `true` we just do the recognition part, and don't bother to push a
       * token.
       */
      silent: boolean
    ) => boolean;

    /**
     * Return `true` if the parsing function has recognized the current position
     * in the input as one if its tokens.
     */
    type BlockParsingRule = (
      /**
       * Representation of the current input stream, and the results of
       * parsing it so far.
       */
      state: StateBlock,

      /**
       * The index of the current line.
       */
      startLine: number,

      /**
       * The index of the last available line.
       */
      endLine: number,

      /**
       * If `true` we just do the recognition part, and don't bother to push a
       * token.
       */
      silent: boolean
    ) => boolean;

    export type Rule<T extends TagToken = TagToken, R extends string = string> = (
      /**
       * The list of tokens currently being processed.
       */
      // tslint:disable-next-line:no-unnecessary-generics
      tokens: T[],

      /**
       * The index of the token currently being processed.
       */
      idx: number,

      /**
       * The options given to remarkable.
       */
      options?: Options,

      /**
       * The key-value store created by the parsing rules.
       */
      env?: Env,

      /**
       * The possible instance of Remarkable. See `fence` renderer function.
       */
      instance?: Remarkable
    ) => R;

    /**
     * Renderer rules.
     */
    interface Rules {
      [name: string]: Rule | { [name: string]: Rule<ContentToken> };
      blockquote_open: Rule<BlockquoteOpenToken>;
      blockquote_close: Rule<BlockquoteCloseToken>;
      code: Rule<CodeToken>;
      fence: Rule<FenceToken>;
      fence_custom: { [name: string]: Rule<FenceToken> };
      heading_open: Rule<HeadingOpenToken>;
      heading_close: Rule<HeadingCloseToken>;
      hr: Rule<HrToken>;
      bullet_list_open: Rule<BulletListOpenToken>;
      bullet_list_close: Rule<BulletListCloseToken>;
      list_item_open: Rule<ListItemOpenToken>;
      list_item_close: Rule<ListItemCloseToken>;
      ordered_list_open: Rule<OrderedListOpenToken>;
      ordered_list_close: Rule<OrderedListCloseToken>;
      paragraph_open: Rule<ParagraphOpenToken>;
      paragraph_close: Rule<ParagraphCloseToken>;
      link_open: Rule<LinkOpenToken>;
      link_close: Rule<LinkCloseToken>;
      image: Rule<ImageToken>;
      table_open: Rule<TableOpenToken>;
      table_close: Rule<TableCloseToken>;
      thead_open: Rule<THeadOpenToken>;
      thead_close: Rule<THeadCloseToken>;
      tbody_open: Rule<TBodyOpenToken>;
      tbody_close: Rule<TBodyCloseToken>;
      tr_open: Rule<TROpenToken>;
      tr_close: Rule<TRCloseToken>;
      th_open: Rule<THOpenToken>;
      th_close: Rule<THCloseToken>;
      td_open: Rule<TDOpenToken>;
      td_close: Rule<TDCloseToken>;
      strong_open: Rule<StrongOpenToken>;
      strong_close: Rule<StrongCloseToken>;
      em_open: Rule<EmOpenToken>;
      em_close: Rule<EmCloseToken>;
      del_open: Rule<DelOpenToken>;
      del_close: Rule<DelCloseToken>;
      ins_open: Rule<InsOpenToken>;
      ins_close: Rule<InsCloseToken>;
      mark_open: Rule<MarkOpenToken>;
      mark_close: Rule<MarkCloseToken>;
      sub: Rule<SubToken>;
      sup: Rule<SupToken>;
      hardbreak: Rule<HardbreakToken>;
      softbreak: Rule<SoftbreakToken>;
      text: Rule<TextToken>;
      htmlblock: Rule<HtmlBlockToken>;
      htmltag: Rule<HtmlTagToken>;
      abbr_open: Rule<AbbrOpenToken>;
      abbr_close: Rule<AbbrCloseToken>;
      footnote_ref: Rule<FootnoteInlineToken>;
      footnote_block_open: Rule<FootnoteBlockOpenToken>;
      footnote_block_close: Rule<FootnoteBlockCloseToken>;
      footnote_open: Rule<FootnoteOpenToken>;
      footnote_close: Rule<FootnoteCloseToken>;
      footnote_anchor: Rule<FootnoteAnchorToken>;
      dl_open: Rule<DlOpenToken>;
      dt_open: Rule<DtOpenToken>;
      dd_open: Rule<DdOpenToken>;
      dl_close: Rule<DlCloseToken>;
      dt_close: Rule<DtCloseToken>;
      dd_close: Rule<DdCloseToken>;

      /**
       * Check to see if `\n` is needed before the next token.
       */
      getBreak: GetBreak;
    }

    interface TagToken {
      /**
       * The nesting level of the associated markdown structure in the source.
       */
      level: number;

      /**
       * The type of the token.
       */
      type: string;

      /**
       * Tokens generated by block parsing rules also include a `lines`
       * property which is a 2 elements array marking the first and last line of the
       * `src` used to generate the token.
       */
      lines?: [number, number];
    }

    interface BlockContentToken extends TagToken {
      /**
       * The content of the block. This might include inline mardown syntax
       * which may need further processing by the inline rules.
       */
      content?: string;

      /**
       * This is initialized with an empty array (`[]`) and will be filled
       * with the inline parser tokens as the inline parsing rules are applied.
       */
      children?: Token[];
    }

    interface ContentToken extends TagToken {
      /**
       * A text token has a `content` property. This is passed to
       * the corresponding renderer to be converted for output.
       */
      content?: any;

      /**
       * Is this a block element
       */
      block?: boolean;
    }

    // ---------------
    // Specific Block Tokens
    // ---------------

    export interface BlockquoteToken extends TagToken {}
    export interface BlockquoteOpenToken extends BlockquoteToken {
      type: "blockquote_open";
    }
    export interface BlockquoteCloseToken extends BlockquoteToken {
      type: "blockquote_close";
    }

    export interface CodeToken extends BlockContentToken {
      /**
       * Code: `true` if block, `false` if inline.
       */
      block: boolean;

      type: "code";
    }

    export interface DlOpenToken extends TagToken {
      type: "dl_open";
    }
    export interface DlCloseToken extends TagToken {
      type: "dl_close";
    }
    export interface DtOpenToken extends TagToken {
      type: "dt_open";
    }
    export interface DtCloseToken extends TagToken {
      type: "dt_close";
    }
    export interface DdOpenToken extends TagToken {
      type: "dd_open";
    }
    export interface DdCloseToken extends TagToken {
      type: "dd_close";
    }

    export interface FenceToken extends ContentToken {
      content: string;
      block?: false;

      /**
       * Fenced block params.
       */
      params: string;
      type: "fence";
    }

    export interface FootnoteGenericToken extends TagToken {
      /**
       * Footnote id.
       */
      id: number;

      /**
       * Footnote sub id.
       */
      subId?: number;
    }
    export interface FootnoteReferenceToken extends FootnoteGenericToken {}
    export interface FootnoteReferenceOpenToken extends FootnoteReferenceToken {
      label: string;
      type: "footnote_reference_open";
    }
    export interface FootnoteReferenceCloseToken extends FootnoteReferenceToken {
      type: "footnote_reference_close";
    }

    export type HeadingValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    export interface HeadingToken extends TagToken {
      hLevel: HeadingValue;
    }
    export interface HeadingOpenToken extends HeadingToken {
      type: "heading_open";
    }
    export interface HeadingCloseToken extends HeadingToken {
      type: "heading_close";
    }

    export interface HrToken extends TagToken {
      type: "hr";
    }

    export interface HtmlBlockToken extends ContentToken {
      content: string;
      block: false;
      type: "htmlblock";
    }

    export interface LHeadingOpenToken extends HeadingOpenToken {}
    export interface LHeadingCloseToken extends HeadingCloseToken {}

    export interface OrderedListToken extends TagToken {}
    export interface OrderedListOpenToken extends OrderedListToken {
      /**
       * Ordered list marker value.
       */
      order: number;
      type: "ordered_list_open";
    }
    interface OrderedListCloseToken extends OrderedListToken {
      type: "ordered_list_close";
    }
    interface BulletListToken extends TagToken {}
    interface BulletListOpenToken extends BulletListToken {
      type: "bullet_list_open";
    }
    interface BulletListCloseToken extends BulletListToken {
      type: "bullet_list_close";
    }
    interface ListItemToken extends TagToken {}
    interface ListItemOpenToken extends ListItemToken {
      type: "list_item_open";
    }
    interface ListItemCloseToken extends ListItemToken {
      type: "list_item_close";
    }

    interface ParagraphToken extends TagToken {
      /**
       * Absence of empty line before current tag: `true` if absent, `false`
       * if present. List is tight if any list item is tight.
       */
      tight: boolean;
    }

    export interface ParagraphOpenToken extends ParagraphToken {
      type: "paragraph_open";
    }

    export interface ParagraphCloseToken extends ParagraphToken {
      type: "paragraph_close";
    }

    export interface TextToken extends TagToken {
      content?: string;
      type: "text";
    }

    export interface StrongToken extends TagToken {}
    export interface StrongOpenToken extends TagToken {
      type: "strong_open";
    }
    export interface StrongCloseToken extends TagToken {
      type: "strong_close";
    }

    interface TableToken extends TagToken {}
    interface TableOpenToken extends TableToken {
      type: "table_open";
    }
    interface TableCloseToken extends TableToken {
      type: "table_close";
    }
    interface THeadToken extends TagToken {}
    interface THeadOpenToken extends THeadToken {
      type: "thead_open";
    }
    interface THeadCloseToken extends THeadToken {
      type: "thead_close";
    }
    interface TBodyToken extends TagToken {}
    interface TBodyOpenToken extends TBodyToken {
      type: "tbody_open";
    }
    interface TBodyCloseToken extends TBodyToken {
      type: "tbody_close";
    }
    interface TRToken extends TagToken {}
    interface TROpenToken extends TRToken {
      type: "tr_open";
    }
    interface TRCloseToken extends TRToken {
      type: "tr_close";
    }
    interface THToken extends TagToken {}
    interface THOpenToken extends THToken {
      type: "th_open";
    }
    interface THCloseToken extends THToken {
      type: "th_close";
    }
    interface TDToken extends TagToken {}
    interface TDOpenToken extends TDToken {
      type: "td_open";
    }
    interface TDCloseToken extends TDToken {
      type: "td_close";
    }

    // ---------------
    // Specific Block Tokens
    // ---------------

    interface LinkToken extends TagToken {}
    interface LinkOpenToken extends LinkToken {
      /**
       * Link url.
       */
      href: string;
      /**
       * Link title.
       */
      title?: string;
      type: "link_open";
    }
    interface LinkCloseToken extends LinkToken {
      type: "link_close";
    }

    interface DelToken extends TagToken {}
    interface DelOpenToken extends DelToken {
      type: "del_open";
    }
    interface DelCloseToken extends DelToken {
      type: "del_open";
    }

    interface EmToken extends TagToken {}
    interface EmOpenToken extends EmToken {
      type: "em_open";
    }
    interface EmCloseToken extends EmToken {
      type: "em_close";
    }

    interface HardbreakToken extends TagToken {
      type: "hardbreak";
    }
    interface SoftbreakToken extends TagToken {
      type: "softbreak";
    }

    interface FootnoteInlineToken extends FootnoteGenericToken {
      type: "footnote_ref";
    }

    interface HtmlTagToken extends ContentToken {
      content: string;
      type: "htmltag";
    }

    interface InsToken extends TagToken {}
    interface InsOpenToken extends InsToken {
      type: "ins_open";
    }
    interface InsCloseToken extends InsToken {
      type: "ins_close";
    }

    interface ImageToken extends ContentToken {
      /**
       * Image url.
       */
      src: string;

      /**
       * Image alt.
       */
      alt: string;

      /**
       * Image title.
       */
      title: string;

      type: "image";
    }

    interface MarkToken extends TagToken {}
    interface MarkOpenToken extends MarkToken {
      type: "mark_open";
    }
    interface MarkCloseToken extends MarkToken {
      type: "mark_close";
    }

    interface SubToken extends ContentToken {
      content: string;
      type: "sub";
    }

    interface SupToken extends ContentToken {
      content: string;
      type: "sup";
    }

    // ---------------
    // Specific Core Tokens
    // ---------------

    interface AbbrToken extends TagToken {}
    interface AbbrOpenToken extends AbbrToken {
      /**
       * Abbreviation title.
       */
      title: string;
      type: "abbr_open";
    }
    interface AbbrCloseToken extends AbbrToken {
      type: "abbr_close";
    }

    interface FootnoteToken extends FootnoteGenericToken {}
    interface FootnoteOpenToken extends FootnoteToken {
      type: "footnote_open";
    }
    interface FootnoteCloseToken extends FootnoteToken {
      type: "footnote_close";
    }

    interface FootnoteBlockToken extends TagToken {}
    interface FootnoteBlockOpenToken extends FootnoteBlockToken {
      type: "footnote_block_open";
    }
    export interface FootnoteBlockCloseToken extends FootnoteBlockToken {
      type: "footnote_block_close";
    }

    export interface FootnoteAnchorToken extends FootnoteGenericToken {
      type: "footnote_anchor";
    }

    export type Token =
      | BlockContentToken
      | ContentToken
      | TagToken
      | BlockquoteToken
      | BlockquoteOpenToken
      | BlockquoteCloseToken
      | CodeToken
      | DlOpenToken
      | DlCloseToken
      | DtOpenToken
      | DtCloseToken
      | DdOpenToken
      | DdCloseToken
      | FenceToken
      | FootnoteGenericToken
      | FootnoteReferenceToken
      | FootnoteReferenceOpenToken
      | FootnoteReferenceCloseToken
      | HeadingToken
      | HeadingOpenToken
      | HeadingCloseToken
      | HrToken
      | HtmlBlockToken
      | LHeadingOpenToken
      | LHeadingCloseToken
      | OrderedListToken
      | OrderedListOpenToken
      | OrderedListCloseToken
      | BulletListToken
      | BulletListOpenToken
      | BulletListCloseToken
      | ListItemToken
      | ListItemOpenToken
      | ListItemCloseToken
      | ParagraphToken
      | ParagraphOpenToken
      | ParagraphCloseToken
      | TextToken
      | StrongToken
      | StrongOpenToken
      | StrongCloseToken
      | TableToken
      | TableOpenToken
      | TableCloseToken
      | THeadToken
      | THeadOpenToken
      | THeadCloseToken
      | TBodyToken
      | TBodyOpenToken
      | TBodyCloseToken
      | TRToken
      | TROpenToken
      | TRCloseToken
      | THToken
      | THOpenToken
      | THCloseToken
      | TDToken
      | TDOpenToken
      | TDCloseToken
      | LinkToken
      | LinkOpenToken
      | LinkCloseToken
      | DelToken
      | DelOpenToken
      | DelCloseToken
      | EmToken
      | EmOpenToken
      | EmCloseToken
      | HardbreakToken
      | SoftbreakToken
      | FootnoteInlineToken
      | HtmlTagToken
      | InsToken
      | InsOpenToken
      | InsCloseToken
      | ImageToken
      | MarkToken
      | MarkOpenToken
      | MarkCloseToken
      | SubToken
      | SupToken
      | AbbrToken
      | AbbrOpenToken
      | AbbrCloseToken
      | FootnoteToken
      | FootnoteOpenToken
      | FootnoteCloseToken
      | FootnoteBlockToken
      | FootnoteBlockOpenToken
      | FootnoteBlockCloseToken
      | FootnoteAnchorToken;
  }

  export class ParserBlock {
    tokenize(state: Remarkable.StateBlock, startLine: number, endLine: number): void;
    parse(
      str: string,
      options: Remarkable.Options,
      env: Remarkable.Env,
      tokens: [Remarkable.Token]
    ): void;
  }

  export class ParserInline {
    skipToken(state: Remarkable.StateInline): void;
    tokenize(state: Remarkable.StateInline): void;
    parse(
      str: string,
      options: Remarkable.Options,
      env: Remarkable.Env,
      tokens: [Remarkable.Token]
    ): void;
    validateLink(url: string): boolean;
  }
}
