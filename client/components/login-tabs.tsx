import * as React from "react";
import * as UITabs from "./tabs";
import Register from "./register";
import Login from "./login-form";

interface IFormHeaderProps {
  children: React.ReactNode;
}

function FormHeader(props: IFormHeaderProps) {
  return (
    <header className="LoginFormHeader">
      <h2 className="FormGreeting" data-testid="LOGIN_TITLE">
        {props.children}
      </h2>
    </header>
  );
}

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
      <UITabs.Panels className="LoginForm">
        <UITabs.Panel label="Register">
          <FormHeader>Sign Up as a New User</FormHeader>
          <Register />
        </UITabs.Panel>
        <UITabs.Panel label="Login">
          <FormHeader>Welcome Back!</FormHeader>
          <Login />
        </UITabs.Panel>
      </UITabs.Panels>
    </UITabs.Container>
  );
}
