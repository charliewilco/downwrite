import * as React from "react";
import * as UITabs from "./tabs";
import * as DefaultStyles from "../utils/defaultStyles";

interface LoginContainerProps {
  renderRegister: () => React.ReactNode;
  renderLogin: () => React.ReactNode;
}

const LoginContainer: React.FC<LoginContainerProps> = props => (
  <UITabs.Container>
    <UITabs.List className="TabsList">
      <UITabs.ListItem
        className="ListItem"
        data-testid="LOGIN_REGISTER_BUTTON"
        id="Register">
        Register
      </UITabs.ListItem>
      <UITabs.ListItem
        className="ListItem"
        data-testid="LOGIN_LOGIN_BUTTON"
        id="Login">
        Login
      </UITabs.ListItem>
    </UITabs.List>
    <UITabs.Panels>
      <UITabs.Panel label="Register">
        <header style={{ padding: 16 }}>
          <h2 data-testid="LOGIN_TITLE">Sign Up as a New User</h2>
        </header>
        {props.renderRegister()}
      </UITabs.Panel>
      <UITabs.Panel label="Login">
        <header style={{ padding: 16 }}>
          <h2 data-testid="LOGIN_TITLE">Welcome Back!</h2>
        </header>
        {props.renderLogin()}
      </UITabs.Panel>
    </UITabs.Panels>
    <style jsx>{`
      h2 {
        margin-bottom: 32px;
        text-align: center;
        font-size: 18px;
        font-weight: 400;
      }
      .FormWrapper {
        box-shadow: var(--shadow);
        max-width: 544px;
        width: 100%;
        background: var(--cardBackground);
        color: var(--color);
      }

      .TabsList {
        display: flex;
        text-align: center;
      }

      .ListItem {
        width: 50%;
        border: 0px;
        appearance: none;
        border-radius: 0px;
        border-bottom-width: 3px;
        border-bottom-style: solid;
        padding-top: 16px;
        padding-bottom: 16px;
        font-family: inherit;
        font-size: 14px;
        font-weight: 700;
        background: inherit;
        box-sizing: inherit;
        border-bottom-color: transparent;
        color: inherit;
      }

      .ListItem.active {
        color: ${DefaultStyles.colors.yellow700};
        border-bottom-color: ${DefaultStyles.colors.yellow700};
      }
    `}</style>
  </UITabs.Container>
);

export default LoginContainer;
