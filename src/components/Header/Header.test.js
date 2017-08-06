import React from 'react'
import ReactDOM from 'react-dom'
import { shallow, mount, render } from 'enzyme'

import Header from './'

let wrapper = shallow(<Header name='Downwrite' />)

describe('Header Component', () => {
  it('renders a header', () => {
    expect(wrapper.exists()).toBe(true)
  })

  xit('contains application name', () => {
    expect(wrapper)
  })
})
