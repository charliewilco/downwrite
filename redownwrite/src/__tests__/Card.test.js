import { Card } from '../components'
import { posts } from './db.json'

const mockDelete = jest.fn()
const id = '6acebce0-20b6-4015-87fe-951c7bb36481'

jest.mock('react-router-dom/Link')

const wrapper = mount(
  <Card title="Starting Again" content={posts[0].content} id={id} onDelete={mockDelete} />
)

describe('Card', () => {
  it('contains snippet from content', () => {
    const snippet = wrapper.find('[data-test="cardDelete"]').text()
    expect(snippet.length).toBeLessThanOrEqual(90)
  })

  it('contains a title', () => {
    console.log(wrapper.find('Link'))
    expect(
      wrapper
        .find('Link')
        .first()
        .text()
    ).toBe('Starting Again')
  })

  // TODO: snapshots are going to be fucked for a while until
  // converted to next.js
  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should fire a delete', () => {
    wrapper.find('[data-test="cardDelete"]').simulate('click')

    expect(mockDelete).toHaveBeenCalled()
  })
})
