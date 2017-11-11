// @flow
import * as React from 'react'
import { Route, Redirect } from 'react-router-dom'

type CustomRouteProps = {
	component: React.ElementType,
	authed: boolean,
	args: Array<number>,
	user: string,
	token: string
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
				<Component token={token} user={user} {...props} />
			) : (
				<Redirect to={{ pathname: '/', state: { from: props.location } }} />
			)}
	/>
)
