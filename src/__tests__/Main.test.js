import Main from '../Main'
import {Card} from '../components'
import { CookiesProvider, Cookies } from 'react-cookie'
import { posts } from './db.json'
import App from '../App'

const cookies = new Cookies()

let wrapper = mount(
	<CookiesProvider cookies={cookies}>
		<MemoryRouter>
			<App />
		</MemoryRouter>
	</CookiesProvider>
)

cookies.get = () => jest.fn().mockReturnValue('someething')

let main = mount(
	<Main cookies={cookies} />
)



describe('<Main /> post lists', () => {
	it('shows login form if logged out', () => {
		wrapper.setState({ authed: false })

		expect(wrapper.find("[data-test='Login Page Container']").exists()).toBe(true)
	})

	it('shows list of Cards if authed and has no posts', () => {
		const instance = main.instance()
		const spy = jest.spyOn(instance, 'getPosts')
		expect(spy).toHaveBeenCalled()
	})
})
