import Remarkable from "remarkable";
import {
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftInlineStyleRange,
  RawDraftEntityRange,
  RawDraftEntity,
  DraftInlineStyleType
} from "draft-js";

type BlockEntities = Record<string | number, (tag: any) => RawDraftEntity>;
type BlockTypes = Record<string, (tag?: Remarkable.Token) => RawDraftContentBlock>;
type BlockStyles = Record<string, DraftInlineStyleType>;

const TRAILING_NEW_LINE = /\n$/;

// In DraftJS, string lengths are calculated differently than in JS itself (due
// to surrogate pairs). Instead of importing the entire UnicodeUtils file from
// FBJS, we use a simpler alternative, in the form of `Array.from`.
//
// Alternative:  const { strlen } = require('fbjs/lib/UnicodeUtils');
function strlen(str?: string) {
  return str ? Array.from(str).length : 0;
}

// Block level items, key is Remarkable's key for them, value returned is
// A function that generates the raw draftjs key and block data.
//
// Why a function? Because in some cases (headers) we need additional information
// before we can determine the exact key to return. And blocks may also return data
const DefaultBlockTypes = {
  paragraph_open: function(
    _item?: Remarkable.ParagraphOpenToken
  ): RawDraftContentBlock {
    return {
      type: "unstyled",
      text: "",
      key: "...",
      entityRanges: [],
      inlineStyleRanges: [],
      depth: 0
    };
  },

  blockquote_open: function(_item?: Remarkable.BlockquoteToken) {
    return {
      type: "blockquote",
      text: ""
    };
  },

  ordered_list_item_open: function(_item?: Remarkable.OrderedListOpenToken) {
    return {
      type: "ordered-list-item",
      text: ""
    };
  },

  unordered_list_item_open: function(
    _item?: Remarkable.BulletListOpenToken
  ): RawDraftContentBlock {
    return {
      type: "unordered-list-item",
      text: "",
      depth: _item!.level,
      entityRanges: [],
      inlineStyleRanges: [],
      key: "..."
    };
  },

  fence: function(_item?: Remarkable.FenceToken): RawDraftContentBlock {
    return {
      type: "code-block",
      data: {
        language: _item!.params || ""
      },
      text: (_item!.content || "").replace(TRAILING_NEW_LINE, ""), // remarkable seems to always append an erronious trailing newline to its codeblock content, so we need to trim it out.
      entityRanges: [],
      inlineStyleRanges: [],
      key: "...",
      depth: 0
    };
  },

  heading_open: function(_item?: Remarkable.HeadingOpenToken): RawDraftContentBlock {
    const levels: Record<Remarkable.HeadingValue, string> = {
      1: "one",
      2: "two",
      3: "three",
      4: "four",
      5: "five",
      6: "six",
      7: "seven",
      8: "eight",
      9: "nine"
    };
    var type = "header-" + levels[_item!.hLevel];

    return {
      type: type,
      text: "",
      depth: _item!.level,
      key: "..",
      entityRanges: [],
      inlineStyleRanges: []
    };
  }
} as const;

// Entity types. These are things like links or images that require
// additional data and will be added to the `entityMap`
// again. In this case, key is remarkable key, value is
// meethod that returns the draftjs key + any data needed.
const DefaultBlockEntities: BlockEntities = {
  link_open: function(item) {
    return {
      type: "LINK",
      mutability: "MUTABLE",
      data: {
        url: item.href,
        href: item.href
      }
    };
  }
};

// Entity styles. Simple Inline styles that aren't added to entityMap
// key is remarkable key, value is draftjs raw key
const DefaultBlockStyles: BlockStyles = {
  strong_open: "BOLD",
  em_open: "ITALIC",
  code: "CODE"
};

// Key generator for entityMap items
var idCounter = -1;
function generateUniqueKey() {
  idCounter++;
  return idCounter;
}

/*
 * Handle inline content in a block level item
 * parses for BlockEntities (links, images) and BlockStyles (em, strong)
 * doesn't handle block level items (blockquote, ordered list, etc)
 *
 * @param <Object> inlineItem - single object from remarkable data representation of markdown
 * @param <Object> BlockEntities - key-value object of mappable block entity items. Passed in as param so users can include their own custom stuff
 * @param <Object> BlockStyles - key-value object of mappable block styles items. Passed in as param so users can include their own custom stuff
 *
 * @return <Object>
 *  content: Entire text content for the inline item,
 *  blockEntities: New block eneities to be added to global block entity map
 *  blockEntityRanges: block-level representation of block entities including key to access the block entity from the global map
 *  blockStyleRanges: block-level representation of styles (eg strong, em)
 */
function parseInline(
  inlineItem: Remarkable.BlockContentToken,
  BlockEntities: BlockEntities,
  BlockStyles: BlockStyles
) {
  var content = "",
    blockEntities: Record<number, RawDraftEntity> = {},
    blockEntityRanges: RawDraftEntityRange[] = [],
    blockInlineStyleRanges: RawDraftInlineStyleRange[] = [];
  inlineItem.children!.forEach(function(child: Remarkable.Token) {
    if (child.type === "text") {
      content += (child as Remarkable.ContentToken).content;
    } else if (child.type === "softbreak") {
      content += "\n";
    } else if (child.type === "hardbreak") {
      content += "\n";
    } else if (BlockStyles[child.type!]) {
      var key = generateUniqueKey();
      var styleBlock = {
        offset: strlen(content) || 0,
        length: 0,
        style: BlockStyles[child.type]
      };

      // Edge case hack because code items don't have inline content or open/close, unlike everything else
      if (child.type === "code") {
        styleBlock.length = strlen((child as Remarkable.CodeToken).content);
        content += (child as Remarkable.CodeToken).content;
      }

      blockInlineStyleRanges.push(styleBlock);
    } else if (BlockEntities[child.type]) {
      var key = generateUniqueKey();

      blockEntities[key] = BlockEntities[child.type](child);

      blockEntityRanges.push({
        offset: strlen(content) || 0,
        length: 0,
        key: key
      });
    } else if (
      child.type.indexOf("_close") !== -1 &&
      BlockEntities[child.type.replace("_close", "_open")]
    ) {
      blockEntityRanges[blockEntityRanges.length - 1].length =
        strlen(content) - blockEntityRanges[blockEntityRanges.length - 1].offset;
    } else if (
      child.type.indexOf("_close") !== -1 &&
      BlockStyles[child.type.replace("_close", "_open")]
    ) {
      var type = BlockStyles[child.type.replace("_close", "_open")];
      blockInlineStyleRanges = blockInlineStyleRanges.map(style => {
        if (style.length === 0 && style.style === type) {
          style.length = strlen(content) - style.offset;
        }
        return style;
      });
    }
  });

  return { content, blockEntities, blockEntityRanges, blockInlineStyleRanges };
}

interface IEntryKeyLists {
  core: string;
  block: string[];
  inline: string[];
}

interface IPresets {
  enable: IEntryKeyLists;
  disable: IEntryKeyLists;
}

interface IDraftOptions {
  remarkablePreset?: "commonmark" | "full" | "remarkable";
  remarkableOptions?: Remarkable.Options & IPresets;
  remarkablePlugins?: Remarkable.Plugin[];
  blockTypes?: BlockTypes;
  blockEntities?: BlockEntities;
  blockStyles?: BlockStyles;
  preserveNewlines: boolean;
}

/**
 * Convert markdown into raw draftjs object
 *
 * @param {String} markdown - markdown to convert into raw draftjs object
 * @param {Object} options - optional additional data, see readme for what options can be passed in.
 *
 * @return {Object} rawDraftObject
 **/
export function markdownToDraft(
  string: string,
  options: IDraftOptions = {
    preserveNewlines: true
  }
): RawDraftContentState {
  const remarkablePreset = options.remarkablePreset || "commonmark";
  const remarkableOptions = options.remarkableOptions;
  const md = new Remarkable(remarkablePreset, remarkableOptions);

  // if tables are not explicitly enabled, disable them by default
  if (
    !remarkableOptions ||
    !remarkableOptions.enable ||
    !remarkableOptions.enable.block ||
    remarkableOptions.enable.block.includes("table") === false
  ) {
    md.block.ruler.disable("table");
  }

  // disable the specified rules
  if (remarkableOptions && remarkableOptions.disable) {
    const n = Object.entries(remarkableOptions.disable) as [
      keyof IEntryKeyLists,
      string
    ][];
    for (let [key, value] of n) {
      md[key].ruler.disable(value);
    }
  }

  // enable the specified rules
  if (remarkableOptions && remarkableOptions.enable) {
    for (let key of Object.keys(remarkableOptions.enable)) {
      let value = remarkableOptions.enable[key as keyof IEntryKeyLists];
      md[key as keyof IEntryKeyLists].ruler.enable(value);
    }
  }

  // If users want to define custom remarkable plugins for custom markdown, they can be added here
  if (options.remarkablePlugins) {
    options.remarkablePlugins.forEach(function(plugin) {
      md.use(plugin, {});
    });
  }

  var blocks: RawDraftContentBlock[] = []; // blocks will be returned as part of the final draftjs raw object
  var entityMap = {}; // entitymap will be returned as part of the final draftjs raw object
  var parsedData = md.parse(string, {}); // remarkable js takes markdown and makes it an array of style objects for us to easily parse
  var currentListType: string | null = null; // Because of how remarkable's data is formatted, we need to cache what kind of list we're currently dealing with
  var previousBlockEndingLine = 0;

  // Allow user to define custom BlockTypes and Entities if they so wish
  const BlockTypes: BlockTypes = Object.assign(
    {},
    DefaultBlockTypes,
    options.blockTypes || {}
  );
  const BlockEntities: BlockEntities = Object.assign(
    {},
    DefaultBlockEntities,
    options.blockEntities || {}
  );
  const BlockStyles = Object.assign(
    {},
    DefaultBlockStyles,
    options.blockStyles || {}
  );

  parsedData.forEach(function(item: Remarkable.Token) {
    // Because of how remarkable's data is formatted, we need to cache what kind of list we're currently dealing with
    if (item.type === "bullet_list_open") {
      currentListType = "unordered_list_item_open";
    } else if (item.type === "ordered_list_open") {
      currentListType = "ordered_list_item_open";
    }

    var itemType = item.type;
    if (itemType === "list_item_open") {
      itemType = currentListType!;
    }

    if (itemType === "inline") {
      // Parse inline content and apply it to the most recently created block level item,
      // which is where the inline content will belong.
      var {
        content,
        blockEntities,
        blockEntityRanges,
        blockInlineStyleRanges
      } = parseInline(item, BlockEntities, BlockStyles);
      var blockToModify = blocks[blocks.length - 1];
      blockToModify.text = content;
      blockToModify.inlineStyleRanges = blockInlineStyleRanges;
      blockToModify.entityRanges = blockEntityRanges;

      // The entity map is a master object separate from the block so just add any entities created for this block to the master object
      Object.assign(entityMap, blockEntities);
    } else if (
      (itemType.indexOf("_open") !== -1 ||
        itemType === "fence" ||
        itemType === "hr") &&
      BlockTypes[itemType]
    ) {
      var depth = 0;
      var block: RawDraftContentBlock | undefined;

      if (item.level > 0) {
        depth = Math.floor(item.level / 2);
      }

      // Draftjs only supports 1 level of blocks, hence the item.level === 0 check
      // List items will always be at least `level==1` though so we need a separate check for that
      // If there’s nested block level items deeper than that, we need to make sure we capture this by cloning the topmost block
      // otherwise we’ll accidentally overwrite its text. (eg if there's a blockquote with 3 nested paragraphs with inline text, without this check, only the last paragraph would be reflected)
      if (item.level === 0 || item.type === "list_item_open") {
        block = Object.assign(
          {
            depth: depth
          },
          BlockTypes[itemType](item)
        );
      } else if (item.level > 0 && blocks[blocks.length - 1].text) {
        block = Object.assign({}, blocks[blocks.length - 1]);
      }

      if (block && options.preserveNewlines) {
        // Re: previousBlockEndingLine.... omg.
        // So remarkable strips out empty newlines and doesn't make any entities to parse to restore them
        // the only solution I could find is that there's a 2-value array on each block item called "lines" which is the start and end line of the block element.
        // by keeping track of the PREVIOUS block element ending line and the NEXT block element starting line, we can find the difference between the new lines and insert
        // an appropriate number of extra paragraphs to re-create those newlines in draftjs.
        // This is probably my least favourite thing in this file, but not sure what could be better.
        var totalEmptyParagraphsToCreate = item.lines![0] - previousBlockEndingLine;
        for (var i = 0; i < totalEmptyParagraphsToCreate; i++) {
          blocks.push(DefaultBlockTypes.paragraph_open());
        }
      }

      if (block) {
        previousBlockEndingLine = item.lines![1];
        blocks.push(block);
      }
    }
  });

  // EditorState.createWithContent will error if there's no blocks defined
  // Remarkable returns an empty array though. So we have to generate a 'fake'
  // empty block in this case. 😑
  if (!blocks.length) {
    blocks.push(DefaultBlockTypes.paragraph_open());
  }

  return {
    entityMap,
    blocks
  };
}
