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

    await page.click("[data-testid='NEW_ENTRY_SUBMIT_BUTTON']");

    await page.waitForSelector("[data-testid='EDIT_ENTRY_CONTAINER']");
    await page.waitForSelector("[data-testid='EDIT_ENTRY_TITLE_ENTRY']");
  });

  it("tap the new button up to navigate to new page", async () => {
    await page.waitForSelector("[data-testid='CREATE_NEW_ENTRY_BUTTON']");
    await page.click("[data-testid='CREATE_NEW_ENTRY_BUTTON']");
    await page.waitForSelector("[data-testid='NEW_EDITOR_FORM']");
  });
  it("Keyboard shortcut", async () => {
    await page.type("[data-testid='NEW_ENTRY_TITLE_ENTRY']", "Hello From 2nd Entry");
    await page.type("div[contentEditable=true]", "_Hello_ from Down Below");

    await page.keyboard.down("Ctrl");
    await page.keyboard.press("KeyS");
    await page.keyboard.up("Ctrl");

    await page.waitForSelector("[data-testid='EDIT_ENTRY_CONTAINER']");
    await page.waitForSelector("[data-testid='EDIT_ENTRY_TITLE_ENTRY']");
  });

  it.todo("Drag and drop markdown file");
});
