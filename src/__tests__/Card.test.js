import { Card } from '../components'
import { MemoryRouter } from 'react-router-dom'
import { posts } from './db.json'

const mockDelete = jest.fn()
const id = '6acebce0-20b6-4015-87fe-951c7bb36481'

const wrapper = mount(
	<MemoryRouter>
		<Card title='Starting Again' content={posts[0].content} id={id} onDelete={mockDelete} />
	</MemoryRouter>
)

describe('Card', () => {
	it('contains snippet from content', () => {
		const snippet = wrapper.find('[data-test="cardDelete"]').text()
		expect(snippet.length).toBeLessThanOrEqual(90)
	})

	it('contains a title', () => {
		expect(wrapper.find('h2').text()).toBe('Starting Again')
	})


	it('should fire a delete', () => {
		wrapper.find('[data-test="cardDelete"]').simulate('click')

		expect(mockDelete).toHaveBeenCalled()
	})
})
