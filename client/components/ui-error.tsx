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

const UIErrorMessage: React.FC<IUIErrorMessage> = ({ errorState, errorActions }) =>
  errorState.content.length > 0 ? (
    <UIFlash
      content={errorState.content}
      type={errorState.type}
      onClose={errorActions.clearFlashMessage}
    />
  ) : (
    <Null />
  );

type HOComponent = React.ComponentType<any> | React.StatelessComponent<any>;

export const withErrors = (Component: HOComponent) => {
  return class extends React.Component<any, any> {
    public static displayName: string = `withErrors(${Component.displayName ||
      Component.name})`;

    public render(): JSX.Element {
      return (
        <ErrorStateContext.Consumer>
          {(errs: IUIErrorMessage) => <Component {...this.props} {...errs} />}
        </ErrorStateContext.Consumer>
      );
    }
  };
};

export const UIErrorConsumer = ErrorStateContext.Consumer;

// TODO: Refactor to use hooks `useReducer`
export class ErrorContainer extends React.Component<IErrorProps, ErrorTypes> {
  public readonly state = {
    content: "",
    type: ""
  };

  private setError = (content: string, type: string): void => {
    this.setState({ content, type });
  };

  private clearFlash = (): void => {
    this.setState({ content: "", type: "" });
  };

  public render(): JSX.Element {
    const value: IUIErrorMessage = {
      errorState: {
        ...this.state
      },
      errorActions: {
        setError: this.setError,
        clearFlashMessage: this.clearFlash
      }
    };

    return (
      <ErrorStateContext.Provider value={value}>
        {this.props.children}
      </ErrorStateContext.Provider>
    );
  }
}

export const UIErrorBanner = withErrors(UIErrorMessage);
