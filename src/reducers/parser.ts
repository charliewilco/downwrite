import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";
import { tagMap, PosTag } from "@utils/parser";

import Tagger from "pos-tagger.js";
import { Output } from "pos-tagger.js/build/js/packages/posTagger/kotlin/posTagger";

import {
  imageLinkDecorators,
  prismHighlightDecorator,
  MultiDecorator
} from "../editor";

export type FlatOutputTree = Record<PosTag, string[]>;
export type StringifiedOutput = Pick<Output, "word" | "tag">;

interface IParserResult {
  tree: Output[][];
  stringified: StringifiedOutput[][];
  flattened: FlatOutputTree;
}

const decorators = new MultiDecorator([
  imageLinkDecorators,
  prismHighlightDecorator
]);

export class DraftParser {
  fromMarkdown(content: string): EditorState {
    const rawEditorState = mdToDraftjs(content);
    return EditorState.createWithContent(
      convertFromRaw({
        blocks: [...rawEditorState.blocks],
        entityMap: {}
      }),
      decorators
    );
  }

  fromEditorState(editorState: EditorState) {
    const raw = convertToRaw(editorState.getCurrentContent());
    const content = draftjsToMd(raw);

    return content;
  }

  _treeToString(tree: Output[][]): StringifiedOutput[][] {
    const r: StringifiedOutput[][] = [];
    for (const branch of tree) {
      r.push(branch.map((b) => ({ tag: b.tag, word: b.word })));
    }

    return r;
  }

  _flat<T>(arr: T[]) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(
        Array.isArray(toFlatten) ? this._treeFlatten(toFlatten) : toFlatten
      );
    }, []);
  }

  _treeFlatten(tree: Output[][]) {
    return this._flat(tree).reduce<FlatOutputTree>((acc, current) => {
      acc[current.tag as PosTag].push(current.word);
      return acc;
    }, tagMap);
  }

  toPOSTags(input: string): IParserResult {
    var processor = new Tagger(Tagger.readModelSync("left3words-wsj-0-18"));

    const tree = processor.tag(input);

    return {
      tree,
      stringified: this._treeToString(tree),
      flattened: this._treeFlatten(tree)
    };
  }
}
