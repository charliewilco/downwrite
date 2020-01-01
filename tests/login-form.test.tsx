import * as React from "react";
import "@testing-library/jest-dom/extend-expect";
import { LinkProps } from "next/link";
import { render, act, fireEvent, wait } from "@testing-library/react";
import { MockedProvider } from "@apollo/react-testing";
import LoginForm from "../components/login-form";
import { MockAuthProvider } from "../components/auth";

jest.mock("next/link", () => {
  return jest.fn((props: React.PropsWithChildren<LinkProps>) => (
    <>{props.children}</>
  ));
});

const signIn = jest.fn();

const testLoginForm = () =>
  render(
    <MockedProvider>
      <MockAuthProvider signIn={signIn}>
        <LoginForm />
      </MockAuthProvider>
    </MockedProvider>
  );

describe("Login Form", () => {
  it("renders and calls sign in from Auth Provider", () => {
    const Form = testLoginForm();

    const username = Form.getByTestId("LOGIN_USERNAME");
    const password = Form.getByTestId("LOGIN_PASSWORD");
    const button = Form.getByTestId("LOGIN_BUTTON");

    expect(Form.container.firstChild).toBeTruthy();
    expect(username).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(button).toBeInTheDocument();

    act(() => {
      fireEvent.change(username, {
        value: "username"
      });
    });

    act(() => {
      fireEvent.change(password, {
        value: "Password123!"
      });
    });

    act(() => {
      fireEvent.click(button);
    });

    wait(() => {
      expect(signIn).toHaveBeenCalled();
    });
  });
});
