/// <reference types="@types/jest-environment-puppeteer" />

import { jest, it, describe } from "@jest/globals";

import { user } from "../../fixtures/user.json";
import { getByTestId } from "./utils";

jest.setTimeout(50000);

describe("Downwrite E2E: Create User and Login", () => {
  it("starts", async () => {
    await page.goto("http://localhost:3000/");
    // await page.setViewport({ width: 1440, height: 766 });
  });

  it("About page", async () => {
    await page.goto("http://localhost:3000/about");
    await page.waitForSelector(getByTestId("ABOUT_PAGE"));
    await page.goto("http://localhost:3000/");
    await page.waitForSelector(getByTestId("HOME_LOGIN_FAKE_BUTTON"));
  });

  it("Successful register to Dashboard", async () => {
    await page.waitForSelector("[data-testid='HOME_LOGIN_FAKE_BUTTON']");
    await page.click("[data-testid='HOME_LOGIN_FAKE_BUTTON']");

    await page.waitForSelector("form");

    await page.type("form #UI_TEXT_INPUT_Username", user.username);

    await page.type("form #UI_TEXT_INPUT_Email", user.email);
    await page.type("form #UI_TEXT_INPUT_Password", user.password);

    await page.waitForSelector("[data-testid='LEGAL_CHECK']");
    await page.click("[data-testid='LEGAL_CHECK']");

    await page.waitForSelector("[data-testid='REGISTER_BUTTON']");
    await page.click("[data-testid='REGISTER_BUTTON']");

    await page.waitForSelector("#NO_ENTRIES_PROMPT");
  });

  it("Log out and log back in", async () => {
    await page.waitForSelector("[data-reach-menu-button]");
    await page.click("[data-reach-menu-button]");

    await page.waitForSelector('[data-valuetext="Sign Out"]');
    await page.click('[data-valuetext="Sign Out"]');

    await page.waitForSelector("[data-testid='LOGIN_LOGIN_TABBUTTON']");
    await page.click("[data-testid='LOGIN_LOGIN_TABBUTTON']");

    await page.waitForSelector("[data-testid='LOGIN_USERNAME']");
    await page.waitForSelector("button#RELOGIN_BUTTON");

    await page.click("[data-testid='LOGIN_USERNAME']");

    await page.waitForSelector("[data-testid='LOGIN_USERNAME']");
    await page.click("[data-testid='LOGIN_USERNAME']");

    await page.type("[data-testid='LOGIN_USERNAME']", user.username);

    await page.type("[data-testid='LOGIN_PASSWORD']", user.password);

    await page.click("button#RELOGIN_BUTTON");
    await page.waitForSelector("#NO_ENTRIES_PROMPT");
  });
});
