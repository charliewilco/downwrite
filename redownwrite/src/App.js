// @flow
import * as React from 'react'
import { Provider, Subscribe } from 'unstated'
import Helmet from 'react-helmet'
import { AuthContainer, OfflineContainer, ErrorContainer } from './containers'
import * as DW from './components'
import Routes from './Routes'

const UIErrorMessage = ({ content, type, onClose }) =>
  content.length > 0 ? (
    <DW.UIFlash content={content} type={type} onClose={onClose} />
  ) : (
    <DW.Null />
  )

const Downwrite = () => (
  <Provider>
    <Subscribe to={[AuthContainer, OfflineContainer, ErrorContainer]}>
      {(auth, offline, err) => (
        <React.Fragment>
          <DW.Offline onChange={offline.handleChange} />
          <DW.Logger value={[auth, offline]} />
          <Helmet title="Downwrite" />
          <DW.Shell
            auth={auth}
            renderErrors={() => <UIErrorMessage {...err.state} onClose={err.clearFlash} />}>
            {closeNav => <Routes auth={auth} closeNav={closeNav} />}
          </DW.Shell>
        </React.Fragment>
      )}
    </Subscribe>
  </Provider>
)

export default Downwrite
