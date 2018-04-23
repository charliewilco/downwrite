// @flow
import React, { Component, createContext } from 'react'
import jwt from 'jwt-decode'
import Cookies from 'universal-cookie'
import addDays from 'date-fns/add_days'

const AuthContext = createContext()

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

export default class extends Component<{ token: string, authed: boolean }, AuthState> {
  constructor(props) {
    super(props)

    let token = this.props.token || cookie.get('DW_TOKEN')

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
    return this.setState(
      { authed, token, user, name },
      cookie.set('DW_TOKEN', token, cookieOptions)
    )
  }

  signOut = () => {
    return this.setState(
      {
        authed: false,
        token: undefined,
        user: undefined,
        name: undefined
      },
      cookie.remove('DW_TOKEN', cookieOptions)
    )
  }

  render() {
    const value = {
      ...this.state,
      signIn: this.signIn,
      signOut: this.signOut
    }

    return <AuthContext.Provider value={value}>{this.props.children}</AuthContext.Provider>
  }
}

export const withAuth = Cx => {
  return class extends Component {
    static displayName = `withAuthContainer(${Cx.displayName || Cx.name})`

    render() {
      return (
        <AuthContext.Consumer>{auth => <Cx {...this.props} {...auth} />}</AuthContext.Consumer>
      )
    }
  }
}
