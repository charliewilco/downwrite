import React, { Component } from 'react'
import styled from 'styled-components'
import { Nav, Toggle, Header } from './'

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

export default class Shell extends Component {
  render() {
    const { children, renderErrors, auth } = this.props
    return (
      <Toggle>
        {(navOpen, toggleNav, closeNav) => (
          <AppContainer>
            {renderErrors && renderErrors()}
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
