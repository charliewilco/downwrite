import { Check } from '../components'

const checkFire = jest.fn()

let wrapper = mount(
  <label>
    <Check checked onChange={checkFire} />
  </label>
)

describe('<Check />', () => {
  it('checks', () => {
    wrapper.find('input').simulate('toggle')
    expect(checkFire).toHaveBeenCalled()
  })

  it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
})
