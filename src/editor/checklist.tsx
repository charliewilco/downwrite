import * as React from "react";
import {
  EditorBlock,
  ContentBlock,
  EditorState,
  ContentState,
  SelectionState
} from "draft-js";
import { Map, Iterable } from "immutable";

function adjustBlockDepthForContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  adjustment: number,
  maxDepth: number
): ContentState {
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  let blockMap = contentState.getBlockMap()!;
  const blocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]])
    .map((block) => {
      let depth = block!.getDepth() + adjustment;
      depth = Math.max(0, Math.min(depth, maxDepth));
      return block?.set("depth", depth);
    }) as Iterable<string, Map<string, any>>;

  blockMap = blockMap.merge(blocks as any);

  return contentState.merge({
    blockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState
  }) as ContentState;
}

const adjustBlockDepth = (
  editorState: EditorState,
  adjustment: number,
  maxDepth: number
): EditorState => {
  const content = adjustBlockDepthForContentState(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    adjustment,
    maxDepth
  );

  return EditorState.push(editorState, content, "adjust-depth");
};

const mergeBlockDataByKey = (
  editorState: EditorState,
  blockKey: string,
  data: { [id: string]: any }
): EditorState => {
  const contentState = editorState.getCurrentContent();
  const updatedBlock = contentState.getBlockForKey(blockKey).mergeIn(["data"], data);
  const blockMap = contentState
    .getBlockMap()
    .merge({ [blockKey]: updatedBlock } as any);
  return EditorState.push(
    editorState,
    contentState.merge({ blockMap }) as ContentState,
    "change-block-data"
  );
};

export const CHECKABLE_LIST_ITEM = "checkable-list-item";
export const UNORDERED_LIST_ITEM = "unordered-list-item";
export const ORDERED_LIST_ITEM = "ordered-list-item";

export class CheckableListItemUtils {
  static toggleChecked(editorState: EditorState, block: ContentBlock): EditorState {
    return mergeBlockDataByKey(editorState, block.getKey(), {
      checked: !block.getData().get("checked")
    });
  }

  static onTab(
    event: React.KeyboardEvent,
    editorState: EditorState,
    maxDepth: number
  ): EditorState {
    const selection = editorState.getSelection();
    const key = selection.getAnchorKey();
    if (key !== selection.getFocusKey()) {
      return editorState;
    }

    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(key);
    const type = block.getType();
    if (
      type !== UNORDERED_LIST_ITEM &&
      type !== ORDERED_LIST_ITEM &&
      type !== CHECKABLE_LIST_ITEM
    ) {
      return editorState;
    }

    event.preventDefault();

    // Only allow indenting one level beyond the block above, and only if
    // the block above is a list item as well.
    const blockAbove = content.getBlockBefore(key);
    if (!blockAbove) {
      return editorState;
    }

    const typeAbove = blockAbove.getType();
    if (
      typeAbove !== UNORDERED_LIST_ITEM &&
      typeAbove !== ORDERED_LIST_ITEM &&
      typeAbove !== CHECKABLE_LIST_ITEM
    ) {
      return editorState;
    }

    const depth = block.getDepth();
    if (!event.shiftKey && depth === maxDepth) {
      return editorState;
    }

    maxDepth = Math.min(blockAbove.getDepth() + 1, maxDepth);

    return adjustBlockDepth(editorState, event.shiftKey ? -1 : 1, maxDepth);
  }
}

const WRAPPER = <ul className="public-DraftStyleDefault-ul" />;

export const checkboxBlockRenderMap = Map({
  [CHECKABLE_LIST_ITEM]: {
    element: "li",
    wrapper: WRAPPER
  }
});

export const blockRenderMapForSameWrapperAsUnorderedListItem = checkboxBlockRenderMap.merge(
  Map({
    [UNORDERED_LIST_ITEM]: {
      element: "li",
      wrapper: WRAPPER
    }
  })
);

type BlockProps = {
  onChangeChecked: () => void;
  checked: boolean;
};

interface ICheckableListItemProps {
  blockProps: BlockProps;
  offsetKey: string;
}

export const CheckableListItem: React.FC<ICheckableListItemProps> = (props) => {
  const {
    offsetKey,
    blockProps: { onChangeChecked, checked }
  } = props;
  return (
    <div
      className={`checkable-list-item-block${checked ? " is-checked" : ""}`}
      data-offset-key={offsetKey}>
      <div
        className="checkable-list-item-block__checkbox"
        contentEditable={false}
        suppressContentEditableWarning>
        <input type="checkbox" checked={checked} onChange={onChangeChecked} />
      </div>
      <div className="checkable-list-item-block__text">
        <EditorBlock {...props} />
      </div>
    </div>
  );
};
