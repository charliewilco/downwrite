// @flow
import { Container } from 'unstated'
import jwt from 'jwt-decode'
import Cookies from 'universal-cookie'
import addDays from 'date-fns/add_days'

// This component should passdown the state of authed from withAuthCheck() HOC
// There is only one single point of state that needs to be rendered

// One other pattern we could consider is passing down user and token as state
// and login and logout functions from authed. this would allow an initial check
// of the cookie on a refresh and as the user is logged in have an updated source of the token
// this would solve that single point of state to be updated.
// We would pass down signIn and signOut to <Login /> & <Register />

/*
	<Auth>
		{(authed, login, logout, token, user) => <App {...args} />}
	</Auth>
*/

// state needs to evaluate the existence of
// token + decode the content of the token

const cookie = new Cookies()
const COOKIE_EXPIRATION = 180
const cookieOptions = {
  path: '/',
  expires: addDays(Date.now(), COOKIE_EXPIRATION)
}

type AuthState = {
  token: string,
  user: ?string,
  name: ?string,
  authed: boolean
}

const EMPTY_USER = {
  user: null,
  name: null
}

export default class AuthContainer extends Container<AuthState> {
  constructor() {
    super()

    let token = cookie.get('DW_TOKEN')

    let __TOKEN_EXISTS__: boolean = token !== undefined && token !== 'undefined'
    const { user, name } = __TOKEN_EXISTS__ ? jwt(token) : EMPTY_USER

    this.state = {
      token,
      authed: __TOKEN_EXISTS__,
      user: user || null,
      name: name || null
    }
  }

  signIn = (authed: boolean, token: string) => {
    const { user, name } = jwt(token)
    cookie.set('DW_TOKEN', token, cookieOptions)

    return this.setState({ authed, token, user, name })
  }

  signOut = () => {
    cookie.remove('DW_TOKEN')

    return this.setState({
      authed: false,
      token: undefined,
      user: undefined,
      name: undefined
    })
  }
}
