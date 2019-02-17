import * as React from "react";
import styled from "styled-components";
import * as UITabs from "./tabs";
import * as DefaultStyles from "../utils/defaultStyles";

const SelectedTitle = styled.h2`
  margin-bottom: 32px;
  text-align: center;
  font-size: 18px;
  font-weight: 400;
`;

const StyledListItem = styled(UITabs.ListItem)`
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

  &.active {
    color: ${DefaultStyles.colors.yellow700};
    border-bottom-color: ${DefaultStyles.colors.yellow700};
  }
`;

const StyledTabsList = styled(UITabs.List)`
  display: flex;
  text-align: center;
`;

const FormWrapper = styled(UITabs.Container)`
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  max-width: 544px;
  width: 100%;
  background: ${props => props.theme.cardBackground};
  color: ${props => props.theme.color};
`;

interface LoginContainerProps {
  renderRegister: () => React.ReactNode;
  renderLogin: () => React.ReactNode;
}

const LoginContainer: React.FC<LoginContainerProps> = props => (
  <FormWrapper>
    <StyledTabsList>
      <StyledListItem data-testid="LOGIN_REGISTER_BUTTON" id="Register">
        Register
      </StyledListItem>
      <StyledListItem data-testid="LOGIN_LOGIN_BUTTON" id="Login">
        Login
      </StyledListItem>
    </StyledTabsList>
    <UITabs.Panels>
      <UITabs.Panel label="Register">
        <header style={{ padding: 16 }}>
          <SelectedTitle data-testid="LOGIN_TITLE">
            Sign Up as a New User
          </SelectedTitle>
        </header>
        {props.renderRegister()}
      </UITabs.Panel>
      <UITabs.Panel label="Login">
        <header style={{ padding: 16 }}>
          <SelectedTitle data-testid="LOGIN_TITLE">Welcome Back!</SelectedTitle>
        </header>
        {props.renderLogin()}
      </UITabs.Panel>
    </UITabs.Panels>
  </FormWrapper>
);

export default LoginContainer;
