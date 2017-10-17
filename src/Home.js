import React, { Component } from 'react'
import { withCookies, Cookies } from 'react-cookie'
import Login from './Login'
import Register from './Register'
import { Block } from 'glamor/jsxstyle'

export default withCookies(props => (
	<Block>
		<Register {...props} />
		<Login {...props} />
	</Block>
))
