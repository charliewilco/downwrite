// @flow

import React, { Component } from 'react'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { Subscribe } from 'unstated'
import { ErrorContainer } from '../utils/containers'
import Logo from '../components/logo'
import Toggle from '../components/toggle'
import loading from '../components/loading'
import { colors } from '../utils/defaultStyles'

const SelectedTitle = styled.h2`
  margin-bottom: 32px;
  text-align: center;
  font-size: 18px;
  font-weight: 400;
`

const ToggleLoginButton = styled.button`
  width: 50%;
  border: 0px;
  appearance: none;
  border-radius: 0px;
  border-bottom-width: 3px;
  border-bottom-style: solid;
  padding-top: 16px;
  padding-bottom: 16px;
  font-family: inherit;
  font-size: 14px;
  border-bottom-color: ${props => (props.active ? colors.yellow700 : 'transparent')};
  color: ${props => (props.active ? colors.yellow700 : 'inherit')};
`

const Intro = styled.div`
  text-align: center;
  color: ${colors.gray100};
  margin-bottom: 32px;

  @media (min-width: 57.75rem) {
    padding-top: 144px;
    text-align: left;
    margin-bottom: 0px;
  }
`

const IntroTitle = styled.h1`
  font-size: 32px;
  margin-top: 16px;
  margin-bottom: 4px;
`

const HomeContainer = styled.main`
  display: flex;
  flex-wrap: wrap;
  width: 95%;
  margin: auto;
  justify-content: space-around;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
`

const ToggleButtonContainer = styled.div`
  display: flex;
`

const LoginFormWrapper = styled.div`
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  max-width: 544px;
  width: 100%;
  background: white;
`
const HomeBannerMarker = styled.div`
  position: relative;
`

const HomeBanner = styled.div`
  width: 100%;
  height: 75vh;
  overflow: hidden;
  transform: skewY(-8.25deg);
  transform-origin: 0;
  background: linear-gradient(
    150deg,
    ${colors.blue400} 15%,
    ${colors.blue700} 70%,
    ${colors.blue400} 94%
  );
  background: linear-gradient(150deg, ${colors.blue400}, ${colors.blue700});

  @media (min-width: 81rem) {
    height: calc(65vh + 5rem);
  }
`

const Login = dynamic(import('../components/login-form'), { loading })
const Register = dynamic(import('../components/register'), { loading })

export default class Home extends Component<{ signIn: Function }, void> {
  render() {
    return (
      <Toggle defaultOpen>
        {(isOpen, toggleInstance, closeInstance, setInstance) => (
          <HomeBannerMarker>
            <HomeBanner />
            <HomeContainer>
              <Intro>
                <Logo />
                <IntroTitle data-test="Login Page Container">Downwrite</IntroTitle>
                <span>A place to write</span>
              </Intro>
              <LoginFormWrapper>
                <ToggleButtonContainer>
                  <ToggleLoginButton
                    active={!isOpen}
                    onClick={() => setInstance(false)}>
                    Register
                  </ToggleLoginButton>
                  <ToggleLoginButton
                    active={isOpen}
                    onClick={() => setInstance(true)}>
                    Login
                  </ToggleLoginButton>
                </ToggleButtonContainer>
                <div>
                  <header style={{ padding: 16 }}>
                    <SelectedTitle>
                      {isOpen ? 'Welcome Back!' : 'Sign Up as a New User'}
                    </SelectedTitle>
                  </header>
                  <Subscribe to={[ErrorContainer]}>
                    {err =>
                      isOpen ? (
                        <Login {...this.props} setError={err.setError} />
                      ) : (
                        <Register {...this.props} setError={err.setError} />
                      )
                    }
                  </Subscribe>
                </div>
              </LoginFormWrapper>
            </HomeContainer>
          </HomeBannerMarker>
        )}
      </Toggle>
    )
  }
}
