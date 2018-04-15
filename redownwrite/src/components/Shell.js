import React, { Component } from 'react'
import { Subscribe } from 'unstated'
import { ErrorContainer } from '../containers'
import styled from 'styled-components'
import { Nav, Toggle, Header, UIFlash, Null } from './'

const ClearFixed = styled.div`
  height: 100%;
  &::after {
    content: '';
    display: table;
    clear: both;
  }
`

ClearFixed.displayName = 'ClearFixed'

const Container = styled.div`
  min-height: 100%;
`

Container.displayName = 'Container'

const AppContainer = styled.div`
  min-height: 100%;
  display: block;
  font-family: var(--primary-font);
`

AppContainer.displayName = 'AppContainer'

const UIErrorMessage = ({ content, type, onClose }) =>
  content.length > 0 ? <UIFlash content={content} type={type} onClose={onClose} /> : <Null />

const UIErrorBanner = () => (
  <Subscribe to={[ErrorContainer]}>
    {err => <UIErrorMessage {...err.state} onClose={err.clearFlash} />}
  </Subscribe>
)

export default class Shell extends Component {
  static displayName = 'UIShell'

  render() {
    const { children, auth } = this.props
    return (
      <Toggle>
        {(navOpen, toggleNav, closeNav) => (
          <AppContainer>
            <UIErrorBanner />
            <ClearFixed>
              <Container>
                <Header authed={auth.state.authed} open={navOpen} onClick={toggleNav} />
                {children}
              </Container>
              {navOpen && (
                <Nav
                  closeNav={closeNav}
                  token={auth.state.token}
                  user={auth.state.user}
                  username={auth.state.name}
                />
              )}
            </ClearFixed>
          </AppContainer>
        )}
      </Toggle>
    )
  }
}
