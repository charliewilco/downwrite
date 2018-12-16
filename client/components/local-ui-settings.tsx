import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";

export interface ILocalUISettings {
  monospace: string;
  actions: {
    updateFont: (font: string) => void;
  };
}

export const LocalUISettings = React.createContext({
  monospace: "",
  actions: {}
} as ILocalUISettings);

export class LocalUISettingsProvider extends React.Component<
  any,
  {
    monospace: string;
  }
> {
  state = {
    monospace: DefaultStyles.fonts.monospace
  };

  componentDidMount() {
    const monospace = localStorage.getItem("DW_EDITOR_FONT");

    this.setState(state => ({
      monospace: [`${monospace},`, state.monospace].join(" ")
    }));
  }

  updateFont = (monospace: string) => {
    this.setState({ monospace });
  };

  render() {
    return (
      <LocalUISettings.Provider
        value={{
          ...this.state,
          actions: {
            updateFont: this.updateFont
          }
        }}>
        {this.props.children}
      </LocalUISettings.Provider>
    );
  }
}

export const LocalUISettingsConsumer = LocalUISettings.Consumer;
