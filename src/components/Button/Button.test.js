import React from 'react'
import { mount } from 'enzyme'
import Button from './'


const onClickHandler = jest.fn()
const wrapper = mount(<Button onClick={onClickHandler} />)

it('Fires onClick', () => {

  wrapper.simulate('click')
  expect(onClickHandler).toHaveBeenCalled()
})
