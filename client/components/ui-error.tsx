import * as React from "react";
import UIFlash from "./ui-flash-messages";
import Null from "./null";

interface ErrorTypes {
  content: string;
  type: string;
}

interface IErrorProps {
  children: React.ReactNode;
}

export interface IUIErrorMessage {
  errorState: ErrorTypes;
  errorActions: {
    setError: (c: string, t: string) => void;
    clearFlashMessage: () => void;
  };
}

export const ErrorStateContext = React.createContext({} as IUIErrorMessage);

const UIErrorMessage: React.FC<{}> = function(props) {
  const { errorState, errorActions } = React.useContext<IUIErrorMessage>(
    ErrorStateContext
  );
  return errorState.content.length > 0 ? (
    <UIFlash
      content={errorState.content}
      type={errorState.type}
      onClose={errorActions.clearFlashMessage}
    />
  ) : (
    <Null />
  );
};

export const UIErrorConsumer = ErrorStateContext.Consumer;

// TODO: Refactor to use hooks `useReducer`
export const ErrorContainer: React.FC<IErrorProps> = function(props) {
  const [errorState, setState] = React.useState<ErrorTypes>({
    content: "",
    type: ""
  });

  const context: IUIErrorMessage = {
    errorState,
    errorActions: {
      setError: (content: string, type: string): void => {
        setState({ content, type });
      },
      clearFlashMessage: (): void => {
        setState({ content: "", type: "" });
      }
    }
  };

  return (
    <ErrorStateContext.Provider value={context}>
      {props.children}
    </ErrorStateContext.Provider>
  );
};

export const UIErrorBanner = UIErrorMessage;
