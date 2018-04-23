// @flow
import * as React from 'react'
import { ErrorContainer } from './containers'
import { withAuth } from './AuthContext'
import { Subscribe } from 'unstated'
import type { Location } from 'react-router-dom'
import Route from 'react-router-dom/Route'
import Redirect from 'react-router-dom/Redirect'

type CustomRouteProps = {
  defaultComponent: React.ElementType,
  path?: string,
  authed?: boolean,
  token?: string,
  user?: string,
  component: React.ElementType,
  args: Array<number>
}

export const PrivateRoute: React.ElementType = withAuth(
  ({ component: Component, authed, token, user, ...args }: CustomRouteProps) => (
    <Subscribe to={[ErrorContainer]}>
      {err => (
        <Route
          {...args}
          render={(props: { location: Location }) =>
            authed === true ? (
              <Component setError={err.setError} token={token} user={user} {...props} />
            ) : (
              <Redirect to={{ pathname: '/', state: { from: props.location } }} />
            )
          }
        />
      )}
    </Subscribe>
  )
)

export const IndexRoute: React.ElementType = withAuth(
  ({
    component: Cx,
    defaultComponent: DCx,
    authed,
    token,
    user,
    signIn,
    signOut
  }: CustomRouteProps) => (
    <Subscribe to={[ErrorContainer]}>
      {err => (
        <Route
          exact
          path="/"
          render={(props: Object) =>
            authed === true ? (
              <Cx setError={err.setError} token={token} user={user} {...props} />
            ) : (
              <DCx signIn={signIn} signOut={signOut} {...props} />
            )
          }
        />
      )}
    </Subscribe>
  )
)

export const PublicRoute: React.ElementType = withAuth(
  ({ component: Component, path, authed, token, user, ...args }: CustomRouteProps) => {
    return (
      <Subscribe to={[ErrorContainer]}>
        {err => (
          <Route
            path={path}
            {...args}
            render={(props: { location: Location }) => (
              <Component setError={err.setError} token={token} user={user} {...props} />
            )}
          />
        )}
      </Subscribe>
    )
  }
)
