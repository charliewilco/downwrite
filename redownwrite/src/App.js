// @flow
import React, { Fragment, Component, type ComponentType } from 'react'
import { Provider } from 'unstated'
import Auth, { withAuth } from './AuthContext'
import OfflineListener from './OfflineContext'
import * as DW from './components'
import Routes from './Routes'
import './utils/typescale.css.js'

type ServerProps = {
  token: string,
  authed: boolean
}

const AuthedShell = withAuth(DW.Shell)
const AuthedRoutes = withAuth(Routes)

export default class extends Component<{
  defaultContext: ServerProps,
  children: ComponentType<*>
}> {
  static displayName = 'Downwrite'

  render() {
    const { defaultContext, children } = this.props

    return (
      <Provider>
        <Auth {...defaultContext}>
          <OfflineListener>
            <Fragment>
              <AuthedShell>{children ? children : <AuthedRoutes />}</AuthedShell>
            </Fragment>
          </OfflineListener>
        </Auth>
      </Provider>
    )
  }
}
