import * as React from "react";
import styled, {
  DefaultTheme,
  ThemeProvider,
  createGlobalStyle
} from "styled-components";
import Checkbox from "./checkbox";
import * as DefaultStyles from "../utils/defaultStyles";

const NIGHT_MODE: string = "NightMDX";

const NightContainer = styled.div`
  padding-top: 16px;
  position: relative;
`;

const NightToggle = styled.form`
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
  { children: React.ReactChild },
  INightModeState
> {
  public static displayName: string = "NightModeContainer";

  public readonly state = {
    night: false
  };

  public componentDidMount(): void {
    const night = JSON.parse(localStorage.getItem("nightMode")) || false;
    this.setState({ night });
  }

  private setNightMode = (status: boolean): void => {
    const { body } = document;
    if (body instanceof HTMLElement) {
      localStorage.setItem("nightMode", status.toString());

      status ? body.classList.add(NIGHT_MODE) : body.classList.remove(NIGHT_MODE);
    }
  };

  public componentDidUpdate(): void {
    const { night } = this.state;
    this.setNightMode(night);
  }

  private onChange = (): void => {
    this.setState(({ night }) => ({ night: !night }));
  };

  public componentWillUnmount(): void {
    if (document.body) {
      document.body.classList.remove(NIGHT_MODE);
    }
  }

  public render(): JSX.Element {
    const { night } = this.state;
    const theme: DefaultTheme = night
      ? DefaultStyles.NIGHT_THEME
      : DefaultStyles.DAY_THEME;

    return (
      <NightModeContext.Provider
        value={{ night, action: { onChange: this.onChange } }}>
        <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
      </NightModeContext.Provider>
    );
  }
}

export const NightModeTrigger: React.FC = ({ children }) => (
  <>
    <NightModeStyles />
    <NightModeContext.Consumer>
      {(context: INightModeContext) => (
        <NightContainer className={context.night ? "NightMode" : ""}>
          <NightToggle role="form" tabIndex={-1} onSubmit={context.action.onChange}>
            <NightController htmlFor="nightToggle">
              <Checkbox
                role="checkbox"
                aria-checked={context.night}
                checked={context.night}
                id="nightToggle"
                onChange={context.action.onChange}
              />
              <NightLabel>Night Mode</NightLabel>
            </NightController>
          </NightToggle>
          {children}
        </NightContainer>
      )}
    </NightModeContext.Consumer>
  </>
);
