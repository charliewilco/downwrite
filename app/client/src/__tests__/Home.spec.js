import puppeteer from 'puppeteer'

const baseURL = 'http://localhost:3000'

let browser, page, html

beforeAll(async () => {
	browser = await puppeteer.launch({ headless: true })
	page = await browser.newPage()
})

describe('Login Flow', () => {
	it('shows registration form', async () => {
		await page.goto(baseURL)
		await page.waitForSelector(`[data-test='Login Page Container']`)
		html = await page.evaluate(body => body.innerHTML, await page.$('h2'))
	})

	it('shows other registration form', () => expect(html).toBe('Welcome Back!'))
})

afterAll(() => {
	browser.close()
})
