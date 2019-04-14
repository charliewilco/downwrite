import * as React from "react";
import * as UITabs from "./tabs";
import Register from "./register";
import Login from "./login-form";

export default function LoginContainer(): JSX.Element {
  return (
    <UITabs.Container className="FormWrapper">
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
            <h2 className="FormGreeting" data-testid="LOGIN_TITLE">
              Sign Up as a New User
            </h2>
          </header>
          <Register />
        </UITabs.Panel>
        <UITabs.Panel label="Login">
          <header style={{ padding: 16 }}>
            <h2 className="FormGreeting" data-testid="LOGIN_TITLE">
              Welcome Back!
            </h2>
          </header>
          <Login />
        </UITabs.Panel>
      </UITabs.Panels>
    </UITabs.Container>
  );
}
