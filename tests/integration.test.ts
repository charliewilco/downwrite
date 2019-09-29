import * as puppeteer from "puppeteer";
import {
  teardown as teardownDevServer,
  setup as setupDevServer
} from "jest-dev-server";

const getByTestID = (id: string): string => `[data-testid='${id}']`;

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const port: number = 7000;
const BASE_URL = "http://localhost:".concat(port.toString());

beforeAll(async () => {
  await setupDevServer({
    command: `yarn dev -p ${port}`,
    launchTimeout: 50000,
    port
  });
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
});

xdescribe("Login Flow", () => {
  beforeAll(async () => {
    await page.goto(BASE_URL);
  });

  it("shows registration form", async () => {
    await page.waitForSelector(getByTestID("LOGIN_PAGE_CONTAINER"));
  });

  it("shows other registration form", async () => {
    const LOGIN_TEXT = "Welcome Back!";
    const REGISTER_TEXT = "Sign Up as a New User";
    await page.waitForSelector(getByTestID("LOGIN_TITLE")).then(async element => {
      const title = await element.jsonValue();

      return title === REGISTER_TEXT;
    });
    await page.waitForSelector(getByTestID("LOGIN_REGISTER_BUTTON"));
    await page.click(getByTestID("LOGIN_REGISTER_BUTTON"));
    await page.waitForSelector(getByTestID("LOGIN_TITLE")).then(async element => {
      const title = await element.jsonValue();

      return title === LOGIN_TEXT;
    });
  });
});

afterAll(async () => {
  await teardownDevServer();
  if (browser) {
    browser.close();
  }
});
