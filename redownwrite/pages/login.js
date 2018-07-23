// @flow
import React, { Component } from 'react'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import LoginContainer from '../components/login-container'
import Landing from '../components/landing'
import Features from '../components/landing-features'
import loading from '../components/loading'
import { colors } from '../utils/defaultStyles'

const HomeContainer = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  padding: 0 8px 64px;
  margin: 0 auto;
`

const Login = dynamic(import('../components/login-form'), { loading })
const Register = dynamic(import('../components/register'), { loading })

type HomeProps = {
  signIn: Function,
  errorActions: { setError: Function }
}

export default class Home extends Component<HomeProps, void> {
  render() {
    const {
      signIn,
      errorActions: { setError }
    } = this.props
    return (
      <HomeContainer>
        <Landing>
          <Features />
        </Landing>
        <LoginContainer>
          {isLoginOpen =>
            isLoginOpen ? (
              <Login setError={setError} signIn={signIn} />
            ) : (
              <Register setError={setError} signIn={signIn} />
            )
          }
        </LoginContainer>
      </HomeContainer>
    )
  }
}
