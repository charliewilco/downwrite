// @flow
import React, { Fragment, Component } from 'react'
import { Provider, Subscribe } from 'unstated'
import Helmet from 'react-helmet'
import { AuthContainer, OfflineContainer } from './containers'
import * as DW from './components'
import Routes from './Routes'

type ServerProps = {
  state: {
    token: string,
    authed: boolean
  },
  signIn: Function,
  signOut: Function
}

export default class extends Component<{ serverContext: ServerProps }> {
  static displayName = 'Downwrite'

  render() {
    const { serverContext } = this.props

    return (
      <Provider>
        <Subscribe to={[AuthContainer, OfflineContainer]}>
          {(auth, offline) => (
            <Fragment>
              <DW.Offline onChange={offline.handleChange} />
              <Helmet title="Downwrite" />
              <DW.Shell auth={serverContext ? serverContext : auth}>
                <Routes auth={serverContext ? serverContext : auth} />
              </DW.Shell>
            </Fragment>
          )}
        </Subscribe>
      </Provider>
    )
  }
}
