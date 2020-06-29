import * as React from "react";
import "@testing-library/jest-dom";
import { render, waitForElement } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import SettingsPage from "../pages/settings";
import { UserDetailsDocument } from "../utils/generated";
import { MockAuthProvider } from "../utils/testing";
import { UIShell } from "../components/ui-shell";

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
      <MockAuthProvider>
        <UIShell>
          <SettingsPage />
        </UIShell>
      </MockAuthProvider>
    </MockedProvider>
  );
}

describe("settings page", () => {
  it("renders settings page and form is prefilled", async () => {
    const Page = createPage(mocks);

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
