import * as React from "react";
import Head from "next/head";
import styled from "styled-components";
import LoginContainer from "../components/login-container";
import Landing from "../components/landing";
import Features from "../components/landing-features";
import Register from "../components/register";
import Login from "../components/login-form";

const HomeContainer = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  padding: 0 8px 64px;
  margin: 0 auto;
`;

// TODO: Migrate back to dynamic element ASAP
// import dynamic from 'next/dynamic';
// import Loading from '../components/loading';

// type Dynamic = Promise<React.ComponentType<{}>>;

// const Login = dynamic(import('../components/login-form'), {
//   loading: () => <Loading size={75} />
// });
//
// const Register = dynamic(import('../components/register'), {
//   loading: () => <Loading size={75} />
// });

interface IHomeProps {
  signIn: (x: boolean, y: string) => void;
  errorActions: {
    setError: (x: string, y: string) => void;
  };
}

export default class Home extends React.Component<IHomeProps, any> {
  render() {
    const {
      signIn,
      errorActions: { setError }
    } = this.props;
    return (
      <>
        <Head>
          <title>Downwrite</title>
        </Head>
        <HomeContainer data-testid="LOGIN_PAGE_CONTAINER">
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
      </>
    );
  }
}
