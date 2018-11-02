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

const ErrorStateContext = React.createContext({});

interface IUIErrorMessage {
  errorState: ErrorTypes;
  errorActions: {
    setError: (c, t) => void;
    clearFlashMessage: () => void;
  };
}

const UIErrorMessage: React.SFC<IUIErrorMessage> = ({
  errorState: { content, type },
  errorActions: { clearFlashMessage }
}) =>
  content.length > 0 ? (
    <UIFlash content={content} type={type} onClose={clearFlashMessage} />
  ) : (
    <Null />
  );

type HOComponent = React.ComponentType<any> | React.StatelessComponent<any>;

export const withErrors = (Component: HOComponent) => {
  return class extends React.Component<any, any> {
    static displayName = `withErrors(${Component.displayName || Component.name})`;

    render() {
      return (
        <ErrorStateContext.Consumer>
          {(errs: IUIErrorMessage) => <Component {...this.props} {...errs} />}
        </ErrorStateContext.Consumer>
      );
    }
  };
};

export class ErrorContainer extends React.Component<IErrorProps, ErrorTypes> {
  state = {
    content: "",
    type: ""
  };

  setError = (content: string, type: string) => this.setState({ content, type });

  clearFlash = () => this.setState({ content: "", type: "" });

  render() {
    const { children } = this.props;

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
        {children}
      </ErrorStateContext.Provider>
    );
  }
}

export const UIErrorBanner = withErrors(UIErrorMessage);
