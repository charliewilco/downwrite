import { Component } from 'react'
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

// state needs to evaluate the existence of token + decode the content of the token
const COOKIE_EXPIRATION = 180

const cookieOptions = {
  path: '/',
  expires: addDays(Date.now(), COOKIE_EXPIRATION)
}

export default class Auth extends Component {
  constructor(props) {
    super(props)

    let token = props.cookie.get('DW_TOKEN')

    let __TOKEN_EXISTS__ = token !== undefined && token !== 'undefined'
    const { user, name } = __TOKEN_EXISTS__ && props.decodeToken(token)

    this.state = {
      token,
      authed: __TOKEN_EXISTS__,
      user: user || null,
      name: name || null
    }
  }

  signIn = (authed, token) => {
    const { user, name } = this.props.decodeToken(token)

    console.log({ token, user, name })

    return this.setState(
      { authed, token, user, name },
      this.props.cookie.set('DW_TOKEN', token, cookieOptions)
    )
  }

  signOut = () =>
    this.setState(
      {
        authed: false,
        token: undefined,
        user: undefined,
        name: undefined
      },
      this.props.cookie.remove('DW_TOKEN')
    )

  render() {
    return this.props.children(
      this.state.authed,
      this.state.token,
      this.state.user,
      this.state.name,
      this.signIn,
      this.signOut
    )
  }
}
