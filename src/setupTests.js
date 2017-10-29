import React from 'react'
import Enzyme, { shallow, mount, render } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import toJson from 'enzyme-to-json'

Enzyme.configure({ adapter: new Adapter() })

global.React = React
global.shallow = shallow
global.render = render
global.mount = mount
global.toJson = toJson
global.fetch = require('jest-fetch-mock')
global.requestAnimationFrame = (cb) => {
  setTimeout(cb, 0)
}

window.matchMedia = window.matchMedia || function() {
	return {
		matches: false,
		addListener: function() {},
		removeListener: function() {}
	}
}
