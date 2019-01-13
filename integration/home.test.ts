import * as puppeteer from "puppeteer";

const BASE_URL = "http://localhost:3000";
const getByTestID = (id: string): string => `[data-testid='${id}']`;

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
});

describe("Login Flow", () => {
  beforeAll(async () => {
    await page.goto(BASE_URL);
  });

  it("shows registration form", async () => {
    await page.waitForSelector(getByTestID("LOGIN_PAGE_CONTAINER"));
  });

  it("shows other registration form", async () => {
    const LOGIN_TEXT = "Welcome Back!";
    const REGISTER_TEXT = "Sign Up as a New User";
    await page
      .waitForSelector(getByTestID("LOGIN_TITLE"))
      .then((title: string) => title === REGISTER_TEXT);
    await page.waitForSelector(getByTestID("LOGIN_REGISTER_BUTTON"));
    await page.click(getByTestID("LOGIN_REGISTER_BUTTON"));
    await page
      .waitForSelector(getByTestID("LOGIN_TITLE"))
      .then((title: string) => title === LOGIN_TEXT);
  });
});

afterAll(() => {
  browser.close();
});
