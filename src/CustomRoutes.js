// @flow
import * as React from 'react'
import { Route, Redirect } from 'react-router-dom'
import Home from './Home'

type CustomRouteProps = {
	component: React.ElementType,
	authed: boolean,
	args: Array<number>,
	user: String,
	token: String
}

export const PrivateRoute: React.ElementType = ({
	component: Component,
	authed,
	user,
	token,
	...args
}: CustomRouteProps) => (
	<Route
		{...args}
		render={(props: { location: string }) =>
			authed === true ? (
				<Component token={token} user={token} {...props} />
			) : (
				<Redirect to={{ pathname: '/', state: { from: props.location } }} />
			)}
	/>
)
