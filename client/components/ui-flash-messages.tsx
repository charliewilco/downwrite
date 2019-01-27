import * as React from "react";
import styled from "styled-components";
import { CloseIcon } from "./icons";
import * as DefaultStyles from "../utils/defaultStyles";

interface IUIFlashProps {
  onClose?: () => void;
  width?: number;
  type?: string;
  content?: string;
  centered?: boolean;
}

const UIFlashContainer = styled.div`
  display: flex;
  border-left: 5px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  z-index: 900;
  max-width: ${(props: IUIFlashProps) => props.width}px;
  left: 0px;
  right: 0px;
  background: ${DefaultStyles.colors.yellow500};
  color: ${DefaultStyles.colors.text};
  position: fixed;
  top: 20px;
  margin: auto;
  text-align: ${(props: IUIFlashProps) => props.centered && "center"};
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
`;

const Stretch = styled.div`
  flex: 1;
`;

const CloseButton = styled.button`
  appearance: none;
  border: 0px;
  color: inherit;
  font-family: inherit;
`;

const prefix = (type: string) => {
  if (type) {
    return `${type.length > 0 && type.toUpperCase()}:`;
  }
};

const UIFlashMessage: React.FC<IUIFlashProps> = props => (
  <UIFlashContainer width={props.width || 512} centered={!props.onClose}>
    <Stretch>
      {prefix(props.type)} {props.content}
    </Stretch>
    {props.onClose && (
      <CloseButton onClick={props.onClose}>
        <CloseIcon fill="currentColor" />
      </CloseButton>
    )}
  </UIFlashContainer>
);

export default UIFlashMessage;

// TODO: This needs a few tests and these functions need to be documented

//
/*
	Should this component wrap every route?
	Will need these props available at the top level of every Route for sure
	will need a type of Flash Message
	<UIFlashContainer>
		<App
			message='' String
			revealMessage={fn()}
			dismissMessage={fn()}
		/>
	</UIFlash>
*/
