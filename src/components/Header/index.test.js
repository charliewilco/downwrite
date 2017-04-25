import React from 'react'
import ReactDOM from 'react-dom'
import { shallow, mount, render } from 'enzyme'

import Header from './'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Header />, div)
})
