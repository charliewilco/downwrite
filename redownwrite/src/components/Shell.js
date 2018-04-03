import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { Nav, Toggle, Header } from './'

export default class Shell extends Component {
  render() {
    const { children, renderErrors, auth } = this.props
    return (
      <Toggle>
        {(navOpen, toggleNav, closeNav) => (
          <Block minHeight="100%" fontFamily="var(--primary-font)">
            {renderErrors && renderErrors()}
            <Block height="100%" className="u-cf">
              <Block minHeight="100%">
                <Header
                  name="Downwrite"
                  authed={auth.state.authed}
                  open={navOpen}
                  onClick={toggleNav}
                />
                {children(closeNav)}
              </Block>
              {navOpen && (
                <Nav
                  closeNav={closeNav}
                  token={auth.state.token}
                  user={auth.state.user}
                  username={auth.state.name}
                />
              )}
            </Block>
          </Block>
        )}
      </Toggle>
    )
  }
}
