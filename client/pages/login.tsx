import * as React from "react";
import Head from "next/head";
import styled from "styled-components";
import LoginTabs from "../components/login-tabs";
import { ErrorStateContext, IUIErrorMessage } from "../components/ui-error";
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
}

const Home: React.FC<IHomeProps> = function(props) {
  const { errorActions } = React.useContext<IUIErrorMessage>(ErrorStateContext);
  return (
    <>
      <Head>
        <title>Downwrite</title>
      </Head>
      <HomeContainer data-testid="LOGIN_PAGE_CONTAINER">
        <Landing>
          <Features />
        </Landing>
        <LoginTabs
          renderLogin={() => (
            <Login setError={errorActions.setError} signIn={props.signIn} />
          )}
          renderRegister={() => (
            <Register setError={errorActions.setError} signIn={props.signIn} />
          )}
        />
      </HomeContainer>
    </>
  );
};

export default Home;
