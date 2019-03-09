import * as React from "react";
import styled, {
  DefaultTheme,
  ThemeProvider,
  createGlobalStyle
} from "styled-components";
import Checkbox from "./checkbox";
import * as DefaultStyles from "../utils/defaultStyles";

const NIGHT_MODE: string = "NightMDX";
const NIGHT_MODE_OFF: string = "NIGHT_MODE_OFF";
const NIGHT_MODE_ON: string = "NIGHT_MODE_ON";

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

export interface INightModeContext {
  night: boolean;
  action: {
    onChange: () => void;
  };
}

export const NightModeContext = React.createContext({} as INightModeContext);

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

const NightModeContainer: React.FC<{ children: React.ReactChild }> = function(
  props
) {
  const [night, setNight] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem(NIGHT_MODE);

      if (local !== NIGHT_MODE_OFF) {
        setNight(true);
      }
    }
  }, []);

  React.useEffect(() => {
    const { body } = document;

    if (body instanceof HTMLElement) {
      localStorage.setItem(NIGHT_MODE, night ? NIGHT_MODE_ON : NIGHT_MODE_OFF);

      night ? body.classList.add(NIGHT_MODE) : body.classList.remove(NIGHT_MODE);
    }

    return function cleanup() {
      if (document.body) {
        document.body.classList.remove(NIGHT_MODE);
      }
    };
  }, [night]);

  const onChange = () => {
    setNight(!night);
  };

  const theme: DefaultTheme = night
    ? DefaultStyles.NIGHT_THEME
    : DefaultStyles.DAY_THEME;

  const context: INightModeContext = {
    night,
    action: { onChange }
  };

  return (
    <NightModeContext.Provider value={context}>
      <style global jsx>{`
        :root {
          --background: ${theme.background};
          --color: ${theme.color};
          --border: ${theme.border};
          --link: ${theme.link};
          --linkHover: ${theme.linkHover};
          --meta: ${theme.meta};
          --inputBorder: ${theme.inputBorder};
          --cardBackground: ${theme.cardBackground};
          --cardTrayBackground: ${theme.cardTrayBackground};
          --cardDeleteButton: ${theme.cardDeleteButton};
          --headerLogoLink: ${theme.headerLogoLink};
          --landingPageTitle: ${theme.landingPageTitle};
        }
      `}</style>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </NightModeContext.Provider>
  );
};

export default NightModeContainer;

export const NightModeTrigger: React.FC = ({ children }) => {
  const { night, action } = React.useContext<INightModeContext>(NightModeContext);
  const onChange = () => {
    action.onChange();
  };

  return (
    <NightContainer className={night ? "NightMode" : ""}>
      <NightModeStyles />
      <NightToggle role="form" tabIndex={-1} onSubmit={onChange}>
        <NightController htmlFor="nightToggle">
          <Checkbox
            role="checkbox"
            aria-checked={night}
            checked={night}
            id="nightToggle"
            onChange={onChange}
          />
          <NightLabel>Night Mode</NightLabel>
        </NightController>
      </NightToggle>
      {children}
    </NightContainer>
  );
};
