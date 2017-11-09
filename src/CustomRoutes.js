// @flow
import * as React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { USER_ID, TOKEN, signOut } from './utils/cookie'

type CustomRouteProps = {
	component: React.ElementType,
	authed: boolean,
	args: Array<number>
}

export const PrivateRoute: React.ElementType = ({
	component: Component,
	authed,
	...args
}: CustomRouteProps) => (
	<Route
		{...args}
		render={(props: { location: string }) =>
			authed === true ? (
				<Component {...props} user={USER_ID} token={TOKEN} signOut={signOut} />
			) : (
				<Redirect to={{ pathname: '/', state: { from: props.location } }} />
			)}
	/>
)

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

export const AuthedRoute: React.ElementType = ({
	component: Component,
	authed,
	...args
}: CustomRouteProps) => (
	<Route
		{...args}
		render={(props: { location: string }) => (<Component />)}
	/>
)

// TODO: Remove /dashboard

export const PublicRoute: React.ElementType = ({
	component: Component,
	authed,
	...args
}: CustomRouteProps) => (
	<Route
		{...args}
		render={(props: Object) =>
			authed === false ? <Component {...props} /> : <Redirect to="/dashboard" />}
	/>
)
