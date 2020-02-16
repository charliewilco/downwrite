import * as React from "react";
import "@testing-library/jest-dom";
import { render, waitForElement, act } from "@testing-library/react";
import { MockedProvider, MockedResponse, wait } from "@apollo/react-testing";
import SettingsPage from "../pages/settings";
import { UserDetailsDocument } from "../utils/generated";
import { MockAuthProvider } from "../utils/testing";
import { MemoryRouter } from "react-router-dom";

const mocks: MockedResponse[] = [
  {
    request: {
      query: UserDetailsDocument
    },
    result: {
      data: {
        settings: {
          username: "charlespeters",
          email: "charlespeters@awesome.com"
        }
      }
    }
  }
];

function createPage(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <MockAuthProvider>
          <SettingsPage />
        </MockAuthProvider>
      </MemoryRouter>
    </MockedProvider>
  );
}

describe("settings page", () => {
  it("renders settings page and form is prefilled", async () => {
    const Page = createPage(mocks);
    act(async () => {
      await wait(0);
    });

    const usernameInput = await waitForElement(() =>
      Page.getByTestId("SETTINGS_USERNAME_INPUT")
    );
    const emailInput = await waitForElement(() =>
      Page.getByTestId("SETTINGS_EMAIL_INPUT")
    );

    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    expect(usernameInput.getAttribute("value")).toContain("charlespeters");
    expect(emailInput.getAttribute("value")).toContain("charlespeters@awesome.com");
  });
});
