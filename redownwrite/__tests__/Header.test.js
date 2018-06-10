import { render, Simulate, wait } from 'react-testing-library'
import 'dom-testing-library/extend-expect'

import { Header } from '../components'

let { getByTestId, container } = render(
  <MemoryRouter>
    <Header authed name="Downwrite" />
  </MemoryRouter>
)

describe('Header Component', () => {
  it('contains application name', () => {
    expect(getByTestId('APP_HEADER_TITLE')).toHaveTextContent('Downwrite')
    expect(getByTestId('APP_HEADER')).toBeTruthy()
  })

  it('matches snapshot', () => {
    expect(container.firstChild).toMatchSnapshot()
  })
})
