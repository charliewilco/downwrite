import * as React from "react";
import * as Reach from "@reach/tabs";
import Register from "./register";
import Login from "./login-form";

interface IFormHeaderProps {
  children: React.ReactNode;
}

function FormHeader(props: IFormHeaderProps) {
  return (
    <header className="LoginFormHeader u-center">
      <h2 className="FormGreeting" data-testid="LOGIN_TITLE">
        {props.children}
      </h2>
    </header>
  );
}

export default function LoginContainer(): JSX.Element {
  return (
    <>
      <Reach.Tabs className="Sheet FormWrapper Wrapper Wrapper--sm">
        <Reach.TabList className="TabsList u-center">
          <Reach.Tab
            className="ListItem"
            data-testid="LOGIN_REGISTER_BUTTON"
            id="Register">
            Register
          </Reach.Tab>
          <Reach.Tab
            className="ListItem"
            data-testid="LOGIN_LOGIN_BUTTON"
            id="Login">
            Login
          </Reach.Tab>
        </Reach.TabList>
        <Reach.TabPanels className="LoginForm">
          <Reach.TabPanel>
            <FormHeader>Sign Up as a New User</FormHeader>
            <Register />
          </Reach.TabPanel>
          <Reach.TabPanel>
            <FormHeader>Welcome Back!</FormHeader>
            <Login />
          </Reach.TabPanel>
        </Reach.TabPanels>
      </Reach.Tabs>
    </>
  );
}
