import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useFormik } from "formik";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

import { useDataSource } from "@hooks/useDataSource";
import { LoginFormSchema, RegisterFormSchema } from "@utils/validations";
import { UIInput, UIInputContainer, UIInputError } from "@components/ui-input";
import { SiteFooter } from "@components/footer";
import { Routes } from "@utils/routes";
import { ILoginValues, IRegisterValues } from "@store/base/me";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const store = useDataSource();
  const loginFormik = useFormik<ILoginValues>({
    initialValues: {
      user: "",
      password: ""
    },
    validationSchema: LoginFormSchema,
    onSubmit(values) {
      store.me.login(values).then(() => router.push(Routes.DASHBOARD));
    }
  });

  const registerFormik = useFormik<IRegisterValues>({
    initialValues: {
      legalChecked: false,
      username: "",
      password: "",
      email: ""
    },
    validationSchema: RegisterFormSchema,
    validateOnChange: false,
    onSubmit(values) {
      store.me.register(values).then(() => router.push(Routes.DASHBOARD));
    }
  });

  return (
    <div data-testid="LOGIN_PAGE_CONTAINER">
      <Head>
        <title>Downwrite</title>
      </Head>
      <article>
        <header>
          <Image
            alt="Downwrite Logo"
            src="/static/landing.png"
            width={128}
            height={128}
          />

          <h1 data-testid="Login Page Container">Login</h1>
        </header>

        <Tabs className="tabs">
          <TabList className="tabs-list">
            <Tab
              className="tab"
              data-testid="LOGIN_REGISTER_TABBUTTON"
              id="Register">
              Register
            </Tab>
            <Tab className="tab" data-testid="LOGIN_LOGIN_TABBUTTON" id="Login">
              Login
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <header className="form-header">
                <h2 data-testid="LOGIN_TITLE">Sign Up as a New User</h2>
              </header>

              <form onSubmit={registerFormik.handleSubmit}>
                <div>
                  <UIInputContainer>
                    <UIInput
                      placeholder="Try for something unique"
                      label="Username"
                      autoComplete="username"
                      {...registerFormik.getFieldProps("username")}
                    />
                    {registerFormik.errors["username"] && (
                      <UIInputError>
                        {registerFormik.errors["username"]}
                      </UIInputError>
                    )}
                  </UIInputContainer>
                  <UIInputContainer>
                    <UIInput
                      placeholder="mail@email.com"
                      label="Email"
                      type="email"
                      autoComplete="email"
                      {...registerFormik.getFieldProps("email")}
                    />
                    {registerFormik.errors["email"] && (
                      <UIInputError>{registerFormik.errors["email"]}</UIInputError>
                    )}
                  </UIInputContainer>
                  <UIInputContainer>
                    <UIInput
                      placeholder="*********"
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      {...registerFormik.getFieldProps("password")}
                    />
                    {registerFormik.errors["password"] && (
                      <UIInputError>
                        {registerFormik.errors["password"]}
                      </UIInputError>
                    )}
                  </UIInputContainer>
                </div>

                <label className="legal-check-container">
                  <input
                    type="checkbox"
                    data-testid="LEGAL_CHECK"
                    name="legalChecked"
                    checked={registerFormik.values.legalChecked}
                    onChange={registerFormik.handleChange}
                  />
                  <small>
                    I&apos;m agreeing to abide in all the{" "}
                    <Link href={Routes.LEGAL} passHref>
                      <a>legal stuff</a>
                    </Link>
                    .
                  </small>
                </label>
                <div className="form-footer">
                  <button
                    className="base-button"
                    disabled={!registerFormik.values.legalChecked}
                    type="submit"
                    data-testid="REGISTER_BUTTON">
                    Register
                  </button>
                </div>
              </form>
            </TabPanel>
            <TabPanel>
              <header className="form-header">
                <h2 data-testid="LOGIN_TITLE">Welcome Back!</h2>
              </header>
              <form onSubmit={loginFormik.handleSubmit}>
                <UIInputContainer>
                  <UIInput
                    testID="LOGIN_USERNAME"
                    placeholder="user@email.com"
                    label="Username or Email"
                    autoComplete="username"
                    {...loginFormik.getFieldProps("user")}
                  />
                  {loginFormik.errors.user && (
                    <UIInputError>{loginFormik.errors.user}</UIInputError>
                  )}
                </UIInputContainer>
                <UIInputContainer>
                  <UIInput
                    testID="LOGIN_PASSWORD"
                    placeholder="*********"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    {...loginFormik.getFieldProps("password")}
                  />
                  {loginFormik.errors.password && (
                    <UIInputError>{loginFormik.errors.password}</UIInputError>
                  )}
                </UIInputContainer>
                <div className="form-footer">
                  <button
                    className="base-button"
                    type="submit"
                    id="RELOGIN_BUTTON"
                    data-testid="RELOGIN_BUTTON">
                    Login
                  </button>
                </div>
              </form>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </article>
      <SiteFooter />
      <style jsx>{`
        article {
          max-width: 32rem;
          margin: 2rem auto;
        }

        header {
          text-align: center;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        h2 {
          font-size: 1.25rem;
          line-height: 1.1;
          font-weight: 400;
        }

        .form-header {
          padding: 2rem 0.5rem;
        }

        form {
          padding: 0 0.5rem 1rem;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
        }

        :global(.tabs) {
          background: var(--surface);
          box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
        }

        :global(.tab) {
          width: 50%;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
