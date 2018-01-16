import { Toggle } from '../components'

let wrapper = mount(
  <Toggle>{(open, toggle) => <button onClick={toggle}>Toggle</button>}</Toggle>
)

describe('<Toggle />', () => {
  it('starts closed and can be opened', () => {
    expect(wrapper.state('open')).toBe(false)
    wrapper.find('button').simulate('click')
    expect(wrapper.state('open')).toBe(true)
  })

  it('can be open by default', () => {
    expect(mount(<Toggle defaultOpen>{() => null}</Toggle>).state('open')).toBe(true)
  })
})
