// @flow
import * as React from 'react'
import AuthContainer from './Auth'
import { Subscribe } from 'unstated'
import { Route, Redirect } from 'react-router-dom'
import type { Location } from 'react-router-dom'

type CustomRouteProps = {
  component: React.ElementType,
  args: Array<number>
}

export const PrivateRoute: React.ElementType = ({
  component: Component,
  ...args
}: CustomRouteProps) => (
  <Subscribe to={[AuthContainer]}>
    {auth => (
      <Route
        {...args}
        render={(props: { location: Location }) =>
          auth.state.authed === true ? (
            <Component token={auth.state.token} user={auth.state.user} {...props} />
          ) : (
            <Redirect to={{ pathname: '/', state: { from: props.location } }} />
          )
        }
      />
    )}
  </Subscribe>
)
