// @flow
import * as React from 'react'
import { Provider, Subscribe } from 'unstated'
import Helmet from 'react-helmet'
import { AuthContainer, OfflineContainer } from './containers'
import * as DW from './components'
import Routes from './Routes'

const Downwrite = () => (
  <Provider>
    <Subscribe to={[AuthContainer, OfflineContainer]}>
      {(auth, offline, err) => (
        <React.Fragment>
          <DW.Offline onChange={offline.handleChange} />
          <Helmet title="Downwrite" />
          <DW.Shell auth={auth}>
            <Routes auth={auth} />
          </DW.Shell>
        </React.Fragment>
      )}
    </Subscribe>
  </Provider>
)

export default Downwrite
