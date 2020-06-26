import { PropsWithChildren } from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import LoginForm from "./login-form";
import Register from "./register";

function FormHeader(props: PropsWithChildren<{}>) {
  return (
    <header className="LoginFormHeader u-center">
      <h2 className="FormGreeting" data-testid="LOGIN_TITLE">
        {props.children}
      </h2>
    </header>
  );
}

/// Reference:
// ---
//
// https://developers.google.com/web/fundamentals/accessibility/focus/using-tabindex
// http://simplyaccessible.com/article/danger-aria-tabs/
// https://inclusive-components.design/tabbed-interfaces/

export default function LoginContainer(): JSX.Element {
  return (
    <Tabs className="Tabs Wrapper Wrapper--sm">
      <TabList className="TabsList u-center">
        <Tab className="ListItem" data-testid="LOGIN_REGISTER_BUTTON" id="Register">
          Register
        </Tab>
        <Tab className="ListItem" data-testid="LOGIN_LOGIN_BUTTON" id="Login">
          Login
        </Tab>
      </TabList>
      <TabPanels className="LoginForm">
        <TabPanel>
          <FormHeader>Sign Up as a New User</FormHeader>
          <Register />
        </TabPanel>
        <TabPanel>
          <FormHeader>Welcome Back!</FormHeader>
          <LoginForm />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
