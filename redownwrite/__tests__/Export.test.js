import Export from '../components/export'
import { render, Simulate } from 'react-testing-library'
import 'dom-testing-library/extend-expect'

const { container } = render(<Export />)

describe('<Export />', () => {
  it('renders', () => {
    expect(container).toBeTruthy()
  })
})
