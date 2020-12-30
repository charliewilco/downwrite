/// <reference types="@types/jest-environment-puppeteer" />

import { jest, it, describe } from "@jest/globals";

// import { user } from "../../fixtures/user.json";

jest.setTimeout(50000);

describe("Downwrite E2E: Create New Entry", () => {
  it("New Page", async () => {
    await page.waitForSelector("[data-testid='GET_STARTED_LINK']");
    await page.click("[data-testid='GET_STARTED_LINK']");
    await page.waitForSelector("[data-testid='NEW_EDITOR_FORM']");
    await page.type("[data-testid='NEW_ENTRY_TITLE_ENTRY']", "Hello From New Entry");
    await page.type("div[contentEditable=true]", "_Hello_ from Down Below");
    await page.keyboard.down("Meta");
    await page.keyboard.press("s");
    await page.keyboard.up("Meta");
    await page.waitForSelector("[data-testid='EDIT_ENTRY_TITLE_ENTRY']");
  });

  it("tap the new button up to to navigate to new page", async () => {
    await page.waitForSelector("[data-testid='CREATE_NEW_ENTRY_BUTTON']");
    await page.click("[data-testid='CREATE_NEW_ENTRY_BUTTON']");
    await page.waitForSelector("[data-testid='NEW_EDITOR_FORM']");
  });
  it.todo("Drag and drop markdown file");
});
