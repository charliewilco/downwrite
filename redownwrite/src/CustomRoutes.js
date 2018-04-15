// @flow
import * as React from 'react'
import { AuthContainer, ErrorContainer } from './containers'
import { Subscribe } from 'unstated'
import { Route, Redirect, type Location } from 'react-router-dom'

type CustomRouteProps = {
  defaultComponent: ?React.ElementType,
  component: React.ElementType,
  args: Array<number>
}

export const PrivateRoute: React.ElementType = ({
  component: Component,
  ...args
}: CustomRouteProps) => (
  <Subscribe to={[AuthContainer, ErrorContainer]}>
    {(auth, err) => (
      <Route
        {...args}
        render={(props: { location: Location }) =>
          auth.state.authed === true ? (
            <Component
              setError={err.setError}
              token={auth.state.token}
              user={auth.state.user}
              {...props}
            />
          ) : (
            <Redirect to={{ pathname: '/', state: { from: props.location } }} />
          )
        }
      />
    )}
  </Subscribe>
)

export const IndexRoute: React.ElementType = ({
  component: Cx,
  defaultComponent: DCx
}: CustomRouteProps) => (
  <Subscribe to={[AuthContainer, ErrorContainer]}>
    {(auth, err) => (
      <Route
        exact
        path="/"
        render={(props: Object) =>
          auth.state.authed === true ? (
            <Cx
              setError={err.setError}
              token={auth.state.token}
              user={auth.state.user}
              {...props}
            />
          ) : (
            <DCx signIn={auth.signIn} signOut={auth.signOut} {...props} />
          )
        }
      />
    )}
  </Subscribe>
)

export const PublicRoute: React.ElementType = ({
  component: Component,
  ...args
}: CustomRouteProps) => (
  <Subscribe to={[AuthContainer, ErrorContainer]}>
    {(auth, err) => (
      <Route
        {...args}
        render={(props: { location: Location }) => (
          <Component
            setError={err.setError}
            token={auth.state.token}
            user={auth.state.user}
            {...props}
          />
        )}
      />
    )}
  </Subscribe>
)
