// @flow
import * as React from 'react'
import { Route, Redirect } from 'react-router-dom'

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
				<Component {...props} />
			) : (
				<Redirect to={{ pathname: '/', state: { from: props.location } }} />
			)}
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
