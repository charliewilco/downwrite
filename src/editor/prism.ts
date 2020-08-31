import Immutable from "immutable";
import { createElement } from "react";
import { ContentBlock, CompositeDecorator } from "draft-js";
import Prism from "prismjs";

function defaultFilter(block: ContentBlock) {
  return block.getType() === "code-block";
}

/**
    Return syntax for highlighting a code block
    @param {Draft.ContentBlock}
    @return {String}
*/
function defaultGetSyntax(block: ContentBlock) {
  const data = block.getData();
  const language = data.get("language") || data.get("syntax");
  if (typeof Prism.languages[language] === "object") {
    return language;
  }
  return null;
}

/**
    Default render for token
    @param {Object} props
    @return {React.Element}
*/
function defaultRender(props: any) {
  return createElement(
    "span",
    { className: "prism-token token " + props.type },
    props.children
  );
}

export class PrismDecorator implements CompositeDecorator {
  private options = {
    // Default language to use
    defaultSyntax: "javascript",

    // Filter block before highlighting
    filter: defaultFilter,

    // Function to get syntax for a block
    getSyntax: defaultGetSyntax,

    // Render a decorated text for a token
    render: defaultRender,

    // Prism module
    prism: Prism
  };
  private highlighted: any = {};

  public getDecorations(block: ContentBlock) {
    console.log("GET DECORATIIONS");
    var tokens,
      token,
      tokenId,
      resultId,
      offset = 0,
      tokenCount = 0;
    var filter = this.options.filter;
    var getSyntax = this.options.getSyntax;
    var blockKey = block.getKey();
    var blockText = block.getText();
    var decorations = Array(blockText.length).fill(null);
    var highlighted = this.highlighted;

    highlighted[blockKey] = {};

    if (!filter(block)) {
      return Immutable.List(decorations);
    }

    var syntax = getSyntax(block) || this.options.defaultSyntax;

    // Allow for no syntax highlighting
    if (syntax == null) {
      return Immutable.List(decorations);
    }

    // Parse text using Prism
    var grammar = Prism.languages[syntax];
    tokens = Prism.tokenize(blockText, grammar);

    function processToken(decorations: any, token: any, offset: number) {
      console.log("process token");
      if (typeof token === "string") {
        return;
      }
      //First write this tokens full length
      tokenId = "tok" + tokenCount++;
      resultId = blockKey + "-" + tokenId;
      highlighted[blockKey][tokenId] = token;
      occupySlice(decorations, offset, offset + token.length, resultId);
      //Then recurse through the child tokens, overwriting the parent
      var childOffset = offset;
      for (var i = 0; i < token.content.length; i++) {
        var childToken = token.content[i];
        processToken(decorations, childToken, childOffset);
        childOffset += childToken.length;
      }
    }

    for (var i = 0; i < tokens.length; i++) {
      token = tokens[i];
      processToken(decorations, token, offset);
      offset += token.length;
    }

    return Immutable.List(decorations);
  }

  public getComponentForKey(_: string) {
    return this.options.render;
  }

  public getPropsForKey(key: string) {
    var parts = key.split("-");
    var blockKey = parts[0];
    var tokId = parts[1];
    var token = this.highlighted[blockKey][tokId];

    return {
      type: token.type
    };
  }
}

function occupySlice(
  targetArr: any,
  start: number,
  end: number,
  componentKey: string
) {
  for (var ii = start; ii < end; ii++) {
    targetArr[ii] = componentKey;
  }
}
