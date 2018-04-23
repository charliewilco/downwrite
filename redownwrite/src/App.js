// @flow
import React, { Fragment, Component, type ComponentType } from 'react'
import { Provider } from 'unstated'
import Helmet from 'react-helmet'
import Auth, { withAuth } from './AuthContext'
import OfflineListener from './OfflineContext'
import * as DW from './components'
import Routes from './Routes'

type ServerProps = {
  token: string,
  authed: boolean
}

const AuthedShell = withAuth(DW.Shell)
const AuthedRoutes = withAuth(Routes)

export default class extends Component<{
  serverContext: ServerProps,
  children: ComponentType<*>
}> {
  static displayName = 'Downwrite'

  render() {
    const { serverContext, children } = this.props

    return (
      <Provider>
        <Auth {...serverContext}>
          <OfflineListener>
            <Fragment>
              <Helmet title="Downwrite" />
              <AuthedShell>{children ? children : <AuthedRoutes />}</AuthedShell>
            </Fragment>
          </OfflineListener>
        </Auth>
      </Provider>
    )
  }
}
