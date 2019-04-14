import * as React from "react";
import { CloseIcon } from "./icons";
import classNames from "../utils/classnames";

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
  const className = classNames("UIFlash", !props.onClose && "UIFlash--center");
  return (
    <div className={className} role="alert">
      <div className="UIFlashStretch">
        {prefix(props.type)} {props.content}
      </div>
      {props.onClose && (
        <button className="UIFlashCloseButton" onClick={props.onClose}>
          <CloseIcon fill="currentColor" />
        </button>
      )}
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
