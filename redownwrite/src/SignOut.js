// @flow
import React, { Component } from 'react'
import { Redirect, type Location } from 'react-router-dom'
import { AuthContainer } from './containers'
import { Subscribe } from 'unstated'

type SnoType = {
  location: Location,
  signOut: Function
}

const withAuth = (Cx: Component<any, void>) => {
  return class extends Component<{ location: Location }, void> {
    static displayName = `withAuthContainer(${Cx.displayName || Cx.name})`

    render() {
      return (
        <Subscribe to={[AuthContainer]}>
          {auth => <Cx signOut={auth.signOut} {...this.props} />}
        </Subscribe>
      )
    }
  }
}

export default withAuth(({ location, signOut }: SnoType) => {
  signOut()

  return <Redirect to={{ pathname: '/', state: { from: location } }} />
})
