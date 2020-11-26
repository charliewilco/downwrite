import {
  ContentBlock,
  ContentState,
  CompositeDecorator,
  DraftDecorator
} from "draft-js";
import React from "react";
import { prismHighlightDecorator } from "./prism";

export const createLinkStrategy = () => {
  const findLinkEntities = (
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    block.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null && contentState.getEntity(entityKey).getType() === "LINK"
      );
    }, callback);
  };
  return findLinkEntities;
};

export const createImageStrategy = () => {
  const findImageEntities = (
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    block.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null && contentState.getEntity(entityKey).getType() === "IMG"
      );
    }, callback);
  };
  return findImageEntities;
};

interface IDecoratorProps {
  entityKey: string;
  contentState: ContentState;
}

const Link: React.FC<IDecoratorProps> = props => {
  const { contentState, children, entityKey } = props;
  const { href, title } = contentState.getEntity(entityKey).getData();
  return (
    <a href={href} title={title}>
      {children}
    </a>
  );
};

const Image: React.FC<IDecoratorProps> = ({ entityKey, children, contentState }) => {
  const { src, alt, title } = contentState.getEntity(entityKey).getData();
  return (
    <span>
      {children}
      <img src={src} alt={alt} title={title} />
    </span>
  );
};

const LINK: DraftDecorator = {
  strategy: createLinkStrategy(),
  component: Link
};

const IMAGE: DraftDecorator = {
  strategy: createImageStrategy(),
  component: Image
};

export const imageLinkDecorators = new CompositeDecorator([LINK, IMAGE]);

export const defaultDecorators = [imageLinkDecorators, prismHighlightDecorator];
