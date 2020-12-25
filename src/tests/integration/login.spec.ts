/// <reference types="@types/jest-environment-puppeteer" />
import mongoose from "mongoose";
import "expect-puppeteer";

import { user } from "../fixtures/user.json";

export const clearDB = async () => {
  console.log("Clearing the database and it's dangerous");
  const db = await mongoose.connect("mongodb://127.0.0.1:27017/downwrite");

  await db.connection.dropDatabase();
  await db.connection.close();
};

describe("Downwrite E2E", () => {
  beforeAll(async () => {
    await clearDB();
    await page.goto("http://localhost:3000/");
  });

  beforeEach(async () => {
    await page.setViewport({ width: 1440, height: 766 });
  });

  it("Successful register to Dashboard", async () => {
    await page.waitForSelector(".mt-16 #HOME_LOGIN_FAKE_BUTTON");
    await page.click(".mt-16 #HOME_LOGIN_FAKE_BUTTON");

    await page.waitForSelector("form #UI_TEXT_INPUT_Username");

    await page.type("form #UI_TEXT_INPUT_Username", user.username);

    await page.type("form #UI_TEXT_INPUT_Email", user.email);
    await page.type("form #UI_TEXT_INPUT_Password", user.password);

    await page.waitForSelector(".p-4 > #tabs--1--panel--0 #legalChecked");
    await page.click(".p-4 > #tabs--1--panel--0 #legalChecked");

    await page.waitForSelector(
      "#tabs--1--panel--0 > form > .text-right > .relative > .bg-pixieblue-400"
    );
    await page.click(
      "#tabs--1--panel--0 > form > .text-right > .relative > .bg-pixieblue-400"
    );

    await page.waitForSelector("#NO_ENTRIES_PROMPT");
  });

  it("Log out and log back in", async () => {
    await page.waitForSelector("[data-reach-menu-button]");
    await page.click("[data-reach-menu-button]");

    await page.waitForSelector('[data-valuetext="Sign Out"]');
    await page.click('[data-valuetext="Sign Out"]');

    await page.waitForSelector("main #tabs--1--tab--1");
    await page.click("main #tabs--1--tab--1");

    await page.waitForSelector("[data-testid='LOGIN_USERNAME']");
    await page.click("[data-testid='LOGIN_USERNAME']");

    await page.waitForSelector("[data-testid='LOGIN_USERNAME']");
    await page.click("[data-testid='LOGIN_USERNAME']");

    await page.type("[data-testid='LOGIN_USERNAME']", user.username);

    await page.type("[data-testid='LOGIN_PASSWORD']", user.password);

    await page.waitForSelector("[data-testid='LOGIN_BUTTON']");
    await page.click("[data-testid='LOGIN_BUTTON']");
    await page.waitForSelector("#NO_ENTRIES_PROMPT");
  });
});
