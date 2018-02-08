// @flow
import React, { Component } from 'react'
import Login from './Login'
import Register from './Register'
import { Block, Flex } from 'glamor/jsxstyle'
import { css } from 'glamor'
import { Logo, withUIFlash } from './components'

const hStyle = css({
  marginBottom: 32,
  textAlign: 'center',
  fontSize: 18,
  fontWeight: 400
})

const navStyle = css({
  width: '50%',
  border: 0,
  appearance: 'none',
  borderRadius: 0,
  borderBottomWidth: 3,
  borderBottomStyle: 'solid',
  paddingTop: 16,
  paddingBottom: 16,
  borderBottomColor: 'transparent'
})

const introStyle = css({
  textAlign: 'center',
  marginBottom: 32,
  '@media (min-width: 57.75rem)': {
    paddingTop: 144,
    textAlign: 'left',
    marginBottom: 0
  }
})

const navStyleAction = css({
  color: `var(--color-6)`,
  borderBottomColor: `var(--color-6)`
})

const Intro = () => (
  <Block color="var(--color-4)" className={css(introStyle)}>
    <Logo />
    <h1
      data-test="Login Page Container"
      className={css({
        fontSize: 32,
        marginTop: 16,
        marginBottom: 4
      })}>
      Downwrite
    </h1>
    <span>A place to write</span>
  </Block>
)

const Container = ({ children }) => (
  <Flex
    flexWrap="wrap"
    width="95%"
    margin="auto"
    justifyContent="space-around"
    position="absolute"
    top={64}
    left={0}
    right={0}
    children={children}
  />
)

class Home extends Component<{ setFlash: Function }, { loginSelected: boolean }> {
  state = {
    loginSelected: true
  }

  errorMessage = (x: string, y: string) => this.props.setFlash(x, y)

  render() {
    const { loginSelected } = this.state
    return (
      <Block position="relative">
        <Block className="HomeBanner" />
        <Container>
          <Intro />
          <Block
            boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
            maxWidth={544}
            width="100%"
            background="white">
            <Flex>
              <button
                className={css(!loginSelected ? [navStyle, navStyleAction] : navStyle)}
                onClick={() => this.setState({ loginSelected: false })}>
                Register
              </button>
              <button
                className={css(loginSelected ? [navStyle, navStyleAction] : navStyle)}
                onClick={() => this.setState({ loginSelected: true })}>
                Login
              </button>
            </Flex>
            <Block>
              <header style={{ padding: 16 }}>
                <h2 className={css(hStyle)}>
                  {loginSelected ? 'Welcome Back!' : 'Sign Up as a New User'}
                </h2>
              </header>
              {loginSelected ? (
                <Login {...this.props} setError={this.errorMessage} />
              ) : (
                <Register {...this.props} setError={this.errorMessage} />
              )}
            </Block>
          </Block>
        </Container>
      </Block>
    )
  }
}

export default withUIFlash(Home)
