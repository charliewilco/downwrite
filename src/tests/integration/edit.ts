/// <reference types="@types/jest-environment-puppeteer" />

import { jest, it, describe } from "@jest/globals";
import { getByTestId } from "./utils";

jest.setTimeout(50000);

describe("Downwrite E2E: Edit & Preview Entry", () => {
  it("should navigate from dashboard to edit", async () => {
    await page.waitForSelector(getByTestId("APP_HEADER_TITLE"));
    await page.click(getByTestId("APP_HEADER_TITLE"));
    await page.waitForSelector(getByTestId("ENTRIES_GRIDVIEW"));
    await page.waitForSelector(getByTestId("CARD"));
    await page.waitForSelector(getByTestId("CARD_TITLE"));
    await page.click(getByTestId("CARD_TITLE"));
    await page.waitForSelector(getByTestId("EDIT_ENTRY_TITLE_ENTRY"));
  });

  it("should update entry", async () => {
    const EDITOR = "div[contentEditable=true]";
    await page.click(EDITOR);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await page.type(EDITOR, "Adding **Content** for every");
    await page.click(getByTestId("UPDATE_ENTRY_SUBMIT_BUTTON"));
    await page.click(getByTestId("APP_HEADER_TITLE"));
    await page.waitForSelector(getByTestId("CARD"));
    await page.waitForSelector(getByTestId("CARD_TITLE"));
    await page.click(getByTestId("CARD_TITLE"));

    const editor = await page.waitForSelector(EDITOR);

    await expect(
      editor.$$eval("*", (nodes) =>
        nodes
          .map((n) => n.textContent)
          .join()
          .includes("Content")
      )
    ).resolves.toBeTruthy();
  });
});
