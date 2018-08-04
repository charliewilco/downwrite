import React, { Component } from 'react'
import styled, { injectGlobal } from 'styled-components'
import Nav from './nav'
import Toggle from './toggle'
import Header from './header'
import NightMode, { NightModeTrigger } from './night-mode'
import UIContainer from './ui-container'
import { ErrorContainer, UIErrorBanner } from './ui-error'
import { colors, fonts } from '../utils/defaultStyles'

import '../utils/global.css'
import '../utils/typescale.css'

injectGlobal`
  *,
  *::before,
  *::after {
    box-sizing: inherit;
    margin: 0;
    padding: 0;
  }

  html {
    height: 100%;
    tab-size: 2;
    box-sizing: border-box;
    text-size-adjust: 100%;
    background-color: #f9fbfc;
    font: 400 100%/1.6 ${fonts.monospace};
    color: ${colors.text};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    display: flex;
    flex-direction: column;
  }


  body,
  #__next {
    width: 100%;
    height: 100%;
  }


  #__next {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }
`

const ClearFixed = styled.div`
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

const AppContainer = styled.div``

AppContainer.displayName = 'AppContainer'

export default class UIShell extends Component {
  static displayName = 'UIShell'

  render() {
    const { children, authed, token, route } = this.props
    return (
      <NightMode>
        <UIContainer>
          <ErrorContainer>
            <Toggle>
              {(navOpen, toggleNav, closeNav) => (
                <NightModeTrigger>
                  <UIErrorBanner />
                  <ClearFixed>
                    <Container>
                      <Header
                        route={route}
                        authed={authed}
                        open={navOpen}
                        onClick={toggleNav}
                      />
                      {children}
                    </Container>
                    {navOpen && (
                      <Nav pathname={route} closeNav={closeNav} token={token} />
                    )}
                  </ClearFixed>
                </NightModeTrigger>
              )}
            </Toggle>
          </ErrorContainer>
        </UIContainer>
      </NightMode>
    )
  }
}
