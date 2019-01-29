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

export default class Home extends React.Component<IHomeProps, any> {
  public static contextType: React.Context<IUIErrorMessage> = ErrorStateContext;

  public render(): JSX.Element {
    const { signIn } = this.props;
    const { setError } = this.context.errorActions;
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
            renderLogin={() => <Login setError={setError} signIn={signIn} />}
            renderRegister={() => <Register setError={setError} signIn={signIn} />}
          />
        </HomeContainer>
      </>
    );
  }
}
