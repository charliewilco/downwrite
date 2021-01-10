import * as React from "react";
import {
  EditorProps,
  EditorState,
  DefaultDraftBlockRenderMap,
  DraftHandleValue
} from "draft-js";
import { Map } from "immutable";
import {
  changeCurrentBlockType,
  handleBlockType,
  handleImage,
  handleInlineStyle,
  handleLink,
  handleNewCodeBlock,
  leaveList,
  insertEmptyBlock,
  insertText,
  replaceText
} from "./modifiers";
import {
  CHECKABLE_LIST_ITEM,
  CheckableListItemUtils,
  checkboxBlockRenderMap,
  CheckableListItem
} from "./checklist";

interface IEditorConfig {
  insertEmptyBlockOnReturnWithModifierKey: boolean;
}

function checkCharacterForState(editorState: EditorState, character: string) {
  let newEditorState = handleBlockType(editorState, character);
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const currentBlock = contentState.getBlockForKey(key);
  const type = currentBlock.getType();
  if (editorState === newEditorState) {
    newEditorState = handleImage(editorState, character);
  }
  if (editorState === newEditorState) {
    newEditorState = handleLink(editorState, character);
  }
  if (editorState === newEditorState && type !== "code-block") {
    newEditorState = handleInlineStyle(editorState, character);
  }
  return newEditorState;
}

function checkReturnForState(
  editorState: EditorState,
  config: IEditorConfig,
  ev?: React.KeyboardEvent
) {
  let newEditorState = editorState;
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const currentBlock = contentState.getBlockForKey(key);
  const type = currentBlock.getType();
  const text = currentBlock.getText();
  if (/-list-item$/.test(type) && text === "") {
    newEditorState = leaveList(editorState);
  }
  if (
    newEditorState === editorState &&
    config.insertEmptyBlockOnReturnWithModifierKey &&
    ev &&
    (ev.ctrlKey ||
      ev.shiftKey ||
      ev.metaKey ||
      ev.altKey ||
      (/^header-/.test(type) &&
        selection.isCollapsed() &&
        selection.getEndOffset() === text.length))
  ) {
    newEditorState = insertEmptyBlock(editorState);
  }
  if (
    newEditorState === editorState &&
    type !== "code-block" &&
    /^```([\w-]+)?$/.test(text)
  ) {
    newEditorState = handleNewCodeBlock(editorState);
  }
  if (newEditorState === editorState && type === "code-block") {
    if (/```\s*$/.test(text)) {
      newEditorState = changeCurrentBlockType(
        newEditorState,
        type,
        text.replace(/\n```\s*$/, "")
      );
      newEditorState = insertEmptyBlock(newEditorState);
    } else {
      newEditorState = insertText(editorState, "\n");
    }
  }
  if (editorState === newEditorState) {
    newEditorState = handleInlineStyle(editorState, "\n");
  }
  return newEditorState;
}

export type EditorStateGetter = () => EditorState;

export interface IPropCreation {
  getEditorState: EditorStateGetter;
  setEditorState(state: EditorState): void;
}

const extendedBlocks = Map({
  "code-block": {
    element: "code",
    wrapper: <pre spellCheck="false" />
  }
}).merge(checkboxBlockRenderMap);

export type EditorPropKeys =
  | "blockRenderMap"
  | "blockStyleFn"
  | "blockRendererFn"
  | "handleReturn"
  | "handleBeforeInput"
  | "handlePastedText";

export type CreatedEditorProps = Pick<EditorProps, EditorPropKeys>;

export const createEditorProps = (
  props: IPropCreation,
  config: IEditorConfig = { insertEmptyBlockOnReturnWithModifierKey: true }
): CreatedEditorProps => ({
  blockRenderMap: DefaultDraftBlockRenderMap.merge(extendedBlocks),
  blockStyleFn(block) {
    switch (block.getType()) {
      case "paragraph":
        return "text-md";
      case "header-one":
        return "text-3xl font-bold mb-6";
      case "header-two":
        return "text-2xl font-bold mb-4";
      case "header-three":
        return "text-xl font-bold mb-4";
      case "blockquote":
        return "border-l-4 text-lg bg-blue-100 border-blue-400 p-4 italic font-serif dark:text-gray-800";
      case CHECKABLE_LIST_ITEM:
        return CHECKABLE_LIST_ITEM;
      default:
        break;
    }
    return "";
  },
  blockRendererFn(block) {
    switch (block.getType()) {
      case CHECKABLE_LIST_ITEM: {
        return {
          component: CheckableListItem,
          props: {
            onChangeChecked: () =>
              props.setEditorState(
                CheckableListItemUtils.toggleChecked(props.getEditorState(), block)
              ),
            checked: !!block.getData().get("checked")
          }
        };
      }
      default:
        return null;
    }
  },
  handleReturn(ev: React.KeyboardEvent, editorState: EditorState): DraftHandleValue {
    const newEditorState = checkReturnForState(editorState, config, ev);
    if (editorState !== newEditorState) {
      props.setEditorState(newEditorState);
      return "handled";
    }
    return "not-handled";
  },
  handleBeforeInput(character: string, editorState: EditorState): DraftHandleValue {
    if (character.match(/[A-z0-9_*~`]/)) {
      return "not-handled";
    }
    const newEditorState = checkCharacterForState(editorState, character);
    if (editorState !== newEditorState) {
      props.setEditorState(newEditorState);
      return "handled";
    }
    return "not-handled";
  },
  handlePastedText(
    text: string,
    html: string,
    editorState: EditorState
  ): DraftHandleValue {
    if (html) {
      return "not-handled";
    }

    if (!text) {
      return "not-handled";
    }

    let newEditorState = editorState;
    let buffer = [];
    for (let i = 0; i < text.length; i += 1) {
      // eslint-disable-line no-plusplus
      if (text[i].match(/[^A-z0-9_*~`]/)) {
        newEditorState = replaceText(newEditorState, buffer.join("") + text[i]);
        newEditorState = checkCharacterForState(newEditorState, text[i]);
        buffer = [];
      } else if (text[i].charCodeAt(0) === 10) {
        newEditorState = replaceText(newEditorState, buffer.join(""));
        const tmpEditorState = checkReturnForState(newEditorState, config);
        if (newEditorState === tmpEditorState) {
          newEditorState = insertEmptyBlock(tmpEditorState);
        } else {
          newEditorState = tmpEditorState;
        }
        buffer = [];
      } else if (i === text.length - 1) {
        newEditorState = replaceText(newEditorState, buffer.join("") + text[i]);
        buffer = [];
      } else {
        buffer.push(text[i]);
      }
    }

    if (editorState !== newEditorState) {
      props.setEditorState(newEditorState);
      return "handled";
    }
    return "not-handled";
  }
});
