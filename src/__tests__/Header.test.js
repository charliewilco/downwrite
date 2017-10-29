import { Header } from '../components'

let wrapper = shallow(<Header name="Downwrite" />)

describe('Header Component', () => {
	it('renders a header', () => {
		expect(wrapper.exists()).toBe(true)
	})

	it('contains application name', () => {
		expect(wrapper.find('h1').contains('Downwrite')).toBe(true)
	})
})
