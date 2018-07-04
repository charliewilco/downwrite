const puppeteer = require('puppeteer')

let browser, page

const { DEBUG } = process.env
const baseURL = 'http://localhost:4000'

jest.setTimeout(15000)

const testID = id => `[data-testid="${id}"]`
const aria = label => `[aria-label="${label}"]`

beforeAll(async () => {
  browser = await puppeteer.launch({ headless: !DEBUG })
  page = await browser.newPage()
})

describe('Login Flow', () => {
  it('shows registration form', async () => {
    await page.goto(baseURL)
    await page.waitForSelector(testID('LOGIN_PAGE_CONTAINER'))
  })

  it('shows other registration form', async () => {
    await page.waitForSelector(testID('LOGIN_BUTTON_REGISTER'))
    await page.click(testID('LOGIN_BUTTON_REGISTER'))
    await page.waitForSelector(testID('LOGIN_FORM_REGISTER'))
  })
})

afterAll(() => {
  browser.close()
})
