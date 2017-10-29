import Main from '../Main'
import {Card} from '../components'
import { CookiesProvider, Cookies } from 'react-cookie'
import { posts } from './db.json'
import { MemoryRouter as Router } from 'react-router-dom'
import App from '../App'

const cookies = new Cookies()

let wrapperUnauthed = mount(
	<CookiesProvider cookies={cookies}>
		<Router>
			<App />
		</Router>
	</CookiesProvider>
)

let wrapperAuthed = mount(<CookiesProvider cookies={cookies}><Main cookies={cookies} /></CookiesProvider>)

describe('<Main /> post lists', () => {
	it('shows login form if logged out', () => {
		wrapperUnauthed.setState({ authed: false })

		expect(wrapperUnauthed.find("[data-test='Login Page Container']").exists()).toBe(true)
	})

	xit('shows list of Cards if authed and has no posts')
})
