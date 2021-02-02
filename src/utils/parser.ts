import Tagger from "pos-tagger.js";
import { Output } from "pos-tagger.js/build/js/packages/posTagger/kotlin/posTagger";

// http://naturalnode.github.io/natural/brill_pos_tagger.html

export var tagLegend = {
  CC: "Coord Conjunction",
  CD: "Cardinal number",
  DT: "Determiner",
  EX: "Existential there",
  FW: "Foreign Word",
  IN: "Preposition",
  JJ: "Adjective",
  JJR: "Adjective, comparative",
  JJS: "Adjective, superlative",
  LS: "List item marker",
  MD: "Modal",
  NN: "Noun, singular or mass",
  NNP: "Proper noun, singular",
  NNPS: "Proper noun, plural",
  NNS: "Noun, plural",
  POS: "Possessive ending",
  PDT: "Predeterminer",
  PP$: "Possessive pronoun",
  PRP: "Personal pronoun",
  RB: "Adverb",
  RBR: "Adverb, comparative",
  RBS: "Adverb, superlative",
  RP: "Particle",
  SYM: "Symbol",
  TO: '"to"',
  UH: "Interjection",
  VB: "Verb, base form",
  VBD: "Verb, past tense",
  VBG: "Verb, gerund",
  VBN: "Verb, past part",
  VBP: "Verb, present",
  VBZ: "Verb, present",
  WDT: "Wh-determiner",
  WP: "Wh pronoun",
  WP$: "Possessive-Wh",
  WRB: "Wh-adverb"
} as const;

export type PosTag = keyof typeof tagLegend;

export var tagMap: Record<PosTag, string[]> = {
  CC: [],
  CD: [],
  DT: [],
  EX: [],
  FW: [],
  IN: [],
  JJ: [],
  JJR: [],
  JJS: [],
  LS: [],
  MD: [],
  NN: [],
  NNP: [],
  NNPS: [],
  NNS: [],
  POS: [],
  PDT: [],
  PP$: [],
  PRP: [],
  RB: [],
  RBR: [],
  RBS: [],
  RP: [],
  SYM: [],
  TO: [],
  UH: [],
  VB: [],
  VBD: [],
  VBG: [],
  VBN: [],
  VBP: [],
  VBZ: [],
  WDT: [],
  WP: [],
  WP$: [],
  WRB: []
};

export type FlatOutputTree = Record<PosTag, string[]>;

export const flatten = (tree: Output[][]): FlatOutputTree => {
  return tree.flat().reduce<FlatOutputTree>((acc, current) => {
    acc[current.tag as PosTag].push(current.word);
    return acc;
  }, tagMap);
};

export type StringifiedOutput = Pick<Output, "word" | "tag">;

export const toString = (tree: Output[][]): StringifiedOutput[][] => {
  const r: StringifiedOutput[][] = [];
  for (const branch of tree) {
    r.push(branch.map((b) => ({ tag: b.tag, word: b.word })));
  }

  return r;
};

interface IParserResult {
  tree: Output[][];
  stringified: StringifiedOutput[][];
  flattened: FlatOutputTree;
}

export const parser = (input: string): IParserResult => {
  var processor = new Tagger(Tagger.readModelSync("left3words-wsj-0-18"));

  const tree = processor.tag(input);

  return {
    tree,
    stringified: toString(tree),
    flattened: flatten(tree)
  };
};
