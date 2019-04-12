import * as React from "react";
import { CloseIcon } from "./icons";
import * as DefaultStyles from "../utils/defaultStyles";

interface IUIFlashProps {
  onClose?: () => void;
  width?: number;
  type?: string;
  content?: string;
  centered?: boolean;
}

const prefix = (type: string) => {
  if (type) {
    return `${type.length > 0 && type.toUpperCase()}:`;
  }
};

export default function UIFlashMessage(props: IUIFlashProps): JSX.Element {
  return (
    <div className="UIFlashContainer" role="alert">
      <div className="Stretch">
        {prefix(props.type)} {props.content}
      </div>
      {props.onClose && (
        <button className="CloseButton" onClick={props.onClose}>
          <CloseIcon fill="currentColor" />
        </button>
      )}
      <style jsx>{`
        .UIFlashContainer {
          display: flex;
          border-left: 5px solid rgba(0, 0, 0, 0.25);
          box-shadow: var(--shadow);
          z-index: 900;
          max-width: ${props.width || 512}px;
          left: 0px;
          right: 0px;
          background: ${DefaultStyles.colors.yellow500};
          color: ${DefaultStyles.colors.text};
          position: fixed;
          top: 20px;
          margin: auto;
          text-align: ${!props.onClose ? "center" : "inherit"};
          padding-top: 8px;
          padding-right: 16px;
          padding-bottom: 8px;
          padding-left: 16px;
        }

        .Stretch {
          flex: 1;
        }

        .CloseButton {
          appearance: none;
          border: 0px;
          color: inherit;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

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
