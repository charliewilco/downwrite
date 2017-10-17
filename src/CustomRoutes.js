import * as React from 'react'
import { Route, Redirect } from 'react-router-dom'

type CustomRouteProps = {
	component: React.ComponentType<void>,
	authed: Boolean,
	args: Array<number>
}

export const PrivateRoute = ({ component: Xcomp, authed, ...args }: CustomRouteProps) => (
	<Route
		{...args}
		render={props =>
			authed === true ? (
				<Xcomp {...props} />
			) : (
				<Redirect to={{ pathname: '/', state: { from: props.location } }} />
			)}
	/>
)

export const PublicRoute = ({ component: Xcomp, authed, ...args }: CustomRouteProps) => (
	<Route
		{...args}
		render={props => (authed === false ? <Xcomp {...props} /> : <Redirect to="/dashboard" />)}
	/>
)
