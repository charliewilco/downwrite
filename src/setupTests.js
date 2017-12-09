import React from 'react'
import Enzyme, { shallow, mount, render } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import toJson from 'enzyme-to-json'
import { MemoryRouter } from 'react-router-dom'

Enzyme.configure({ adapter: new Adapter() })

function storageMock() {
	var storage = {}

	return {
		setItem: function(key, value) {
			storage[key] = value || ''
		},
		getItem: function(key) {
			return key in storage ? storage[key] : null
		},
		removeItem: function(key) {
			delete storage[key]
		},
		get length() {
			return Object.keys(storage).length
		},
		key: function(i) {
			var keys = Object.keys(storage)
			return keys[i] || null
		}
	}
}

global.React = React
global.shallow = shallow
global.render = render
global.mount = mount
global.toJson = toJson
global.MemoryRouter = MemoryRouter
global.fetch = require('jest-fetch-mock')
global.localStorage = storageMock()

// global.XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest

window.matchMedia =
	window.matchMedia ||
	function() {
		return {
			matches: false,
			addListener: function() {},
			removeListener: function() {}
		}
	}

global.user = '59ed5b03992843434f6fc8bb'
global.token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5ZWQ1YjAzOTkyODQzNDM0ZjZmYzhiYiIsInVzZXJuYW1lIjoidGVzdCIsImlhdCI6MTUwOTU0NjI0NSwiZXhwIjoxNTA5NzE5MDQ1fQ.Go22Ea4XIILguaM7G-Hek27-aDUI7r0OnMT6MTq72s8'
