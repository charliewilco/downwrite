import { render, Simulate, wait } from 'react-testing-library'
import 'dom-testing-library/extend-expect'
import Dashboard from '../Dashboard'
import { posts } from './db.json'

describe('<Dashboard /> post lists', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('shows list of Cards if authed and has posts', async () => {
    fetch.mockResponseOnce(JSON.stringify(posts))
    let { container, getByTestId } = render(<Dashboard user={user} token={token} />)
    await wait(() => getByTestId('CARD'))

    expect(container).toBeTruthy()
    expect(getByTestId('CARD')).toHaveTextContent('One More Thing')
  })

  it('can toggle from grid to list', async () => {})
  it('shows prompt to write more if no posts', async () => {})
  it('can prompt to delete')
})
