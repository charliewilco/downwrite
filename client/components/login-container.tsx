import * as React from "react";
import styled from "styled-components";
import Toggle from "./toggle";
import { colors } from "../utils/defaultStyles";

const SelectedTitle = styled.h2`
  margin-bottom: 32px;
  text-align: center;
  font-size: 18px;
  font-weight: 400;
`;

const ToggleLoginButton = styled.button`
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
  background: inherit;
  box-sizing: inherit;
  border-bottom-color: ${(props: { active: boolean }) =>
    props.active ? colors.yellow700 : "transparent"};
  color: ${(props: { active: boolean }) =>
    props.active ? colors.yellow700 : "inherit"};
`;

const ToggleButtonContainer = styled.div`
  display: flex;
`;

const LoginFormWrapper = styled.div`
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  max-width: 544px;
  width: 100%;
  background: white;
  color: ${colors.text};
`;

const LoginContainer: React.SFC<{ children: (x: boolean) => React.ReactNode }> = ({
  children
}) => (
  <Toggle defaultOpen>
    {({ isOpen, onSetInstance }) => (
      <LoginFormWrapper>
        <ToggleButtonContainer>
          <ToggleLoginButton
            data-testid="LOGIN_REGISTER_BUTTON"
            active={!isOpen}
            onClick={() => onSetInstance(false)}>
            Register
          </ToggleLoginButton>
          <ToggleLoginButton
            data-testid="LOGIN_LOGIN_BUTTON"
            active={isOpen}
            onClick={() => onSetInstance(true)}>
            Login
          </ToggleLoginButton>
        </ToggleButtonContainer>
        <div>
          <header style={{ padding: 16 }}>
            <SelectedTitle data-testid="LOGIN_TITLE">
              {isOpen ? "Welcome Back!" : "Sign Up as a New User"}
            </SelectedTitle>
          </header>
          {children(isOpen)}
        </div>
      </LoginFormWrapper>
    )}
  </Toggle>
);

export default LoginContainer;
