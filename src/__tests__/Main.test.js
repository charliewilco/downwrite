import Main from '../Main'
import { Card } from '../components'
import { posts } from './db.json'
import App from '../App'
import { createWaitForElement } from 'enzyme-wait';

const waitFor = createWaitForElement('[data-test="Card"]', 5000, 5000)

describe('<Main /> post lists', () => {
	it('shows login form if logged out', () => {
		let wrapper = mount(
			<MemoryRouter>
				<App />
			</MemoryRouter>
		)

		expect(wrapper.find("[data-test='Login Page Container']").exists()).toBe(true)
	})

	xit('shows list of Cards if authed and has no posts', async () => {
		await fetch.mockResponse(JSON.stringify(posts))

		let main = mount(
			<MemoryRouter>
				<Main user={user} token={token} />
			</MemoryRouter>
		)


		const loadedMain = await waitFor(main)

		console.log(main.debug())


		expect(main.exists()).toBe(true)
		expect(main.find('h2').contains('Starting Again')).toBe(true)
	})
})
