import * as React from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import Checkbox from "./checkbox";
import * as DefaultStyles from "../utils/defaultStyles";

const NIGHT_MODE: string = "NightMDX";

const NightContainer = styled.div`
  padding-top: 16px;
  position: relative;
`;

const NightToggle = styled.div`
  color: ${DefaultStyles.colors.text};
  padding: 8px;
  font-family: ${DefaultStyles.fonts.sans};
  margin: 16px 8px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background: white;
  bottom: 0;
  z-index: 50;
  position: fixed;
`;

const NightLabel = styled.small`
  margin-left: 8px;
`;

const NightController = styled.label`
  display: flex;
  align-items: center;
`;

interface INightModeContext {
  night: boolean;
  action: {
    onChange: () => void;
  };
}

interface INightModeProps {
  children: React.ReactNode;
}

interface INightModeState {
  night: boolean;
}

const NightModeContext = React.createContext({});

const NightModeStyles = createGlobalStyle`
  .NightMDX {}

  .NightMode {
    transition: background 375ms ease-in-out;
  }

  .NightMode .PreviewBody blockquote,
  .NightMode blockquote {
    background: none;
    color: ${DefaultStyles.colors.blue100} !important;
  }
`;

export default class NightModeContainer extends React.Component<
  INightModeProps,
  INightModeState
> {
  static displayName = "NightModeContainer";

  state = {
    night: false
  };

  componentDidMount() {
    let night = JSON.parse(localStorage.getItem("nightMode")) || false;
    this.setState({ night });
  }

  setNightMode = (status: boolean) => {
    const { body } = document;
    if (body instanceof HTMLElement) {
      localStorage.setItem("nightMode", status.toString());

      status ? body.classList.add(NIGHT_MODE) : body.classList.remove(NIGHT_MODE);
    }
  };

  componentDidUpdate() {
    const { night } = this.state;
    this.setNightMode(night);
  }

  onChange = () => {
    this.setState(({ night }) => ({ night: !night }));
  };

  componentWillUnmount() {
    if (document.body) {
      document.body.classList.remove(NIGHT_MODE);
    }
  }

  render() {
    const { night } = this.state;
    const { children } = this.props;
    return (
      <NightModeContext.Provider
        value={{ night, action: { onChange: this.onChange } }}>
        <ThemeProvider
          theme={night ? DefaultStyles.NIGHT_THEME : DefaultStyles.DAY_THEME}>
          {children}
        </ThemeProvider>
      </NightModeContext.Provider>
    );
  }
}

export const NightModeTrigger: React.SFC<INightModeProps> = ({ children }) => (
  <>
    <NightModeStyles />
    <NightModeContext.Consumer>
      {(context: INightModeContext) => (
        <NightContainer className={context.night ? "NightMode" : ""}>
          <NightToggle>
            <NightController>
              <Checkbox checked={context.night} onChange={context.action.onChange} />
              <NightLabel>Night Mode</NightLabel>
            </NightController>
          </NightToggle>
          {children}
        </NightContainer>
      )}
    </NightModeContext.Consumer>
  </>
);
