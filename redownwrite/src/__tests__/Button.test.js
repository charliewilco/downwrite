import { Button } from '../components'

const onClickHandler = jest.fn()
const wrapper = mount(<Button onClick={onClickHandler} />)

describe('Button', () => {
  it('Fires onClick', () => {
    wrapper.simulate('click')
    expect(onClickHandler).toHaveBeenCalled()
  })

  it('matches snapshot', () => expect(wrapper).toMatchSnapshot())
})
