import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useFormik } from "formik";

import { useDataSource } from "@hooks/useDataSource";
import { CustomMeta } from "@components/custom-meta";
import { UIInput, UIInputError } from "@components/ui-input";
import { SiteFooter } from "@components/footer";
import { IRegisterValues } from "@data/base/auth";
import { RegisterFormSchema, zodAdapter } from "@shared/validations";
import { Routes } from "@shared/routes";

const RegisterPage: NextPage = () => {
  const router = useRouter();
  const dataSource = useDataSource();

  const formik = useFormik<IRegisterValues>({
    initialValues: {
      legalChecked: false,
      username: "",
      password: "",
      email: ""
    },
    validationSchema: zodAdapter(RegisterFormSchema),
    validateOnChange: false,
    validateOnMount: false,
    onSubmit(values) {
      dataSource.auth.register(values).then(() => router.push(Routes.DASHBOARD));
    }
  });

  return (
    <div data-testid="LOGIN_PAGE_CONTAINER">
      <CustomMeta title="Login" path="login" />
      <article>
        <header>
          <Image
            alt="Downwrite Logo"
            src="/static/landing.png"
            width={128}
            height={128}
          />

          <h1 data-testid="Login Page Container">Register</h1>
        </header>

        <div className="tabs">
          <header className="form-header">
            <h2 data-testid="LOGIN_TITLE">Register as a New User</h2>
          </header>
          <form onSubmit={formik.handleSubmit}>
            <div>
              <div>
                <UIInput
                  placeholder="Try for something unique"
                  label="Username"
                  autoComplete="username"
                  {...formik.getFieldProps("username")}
                />
                {formik.errors["username"] && (
                  <UIInputError>{formik.errors["username"]}</UIInputError>
                )}
              </div>
              <div>
                <UIInput
                  placeholder="mail@email.com"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  {...formik.getFieldProps("email")}
                />
                {formik.errors["email"] && (
                  <UIInputError>{formik.errors["email"]}</UIInputError>
                )}
              </div>
              <div>
                <UIInput
                  placeholder="*********"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  {...formik.getFieldProps("password")}
                />
                {formik.errors["password"] && (
                  <UIInputError>{formik.errors["password"]}</UIInputError>
                )}
              </div>
            </div>

            <label className="legal-check-container">
              <input
                type="checkbox"
                data-testid="LEGAL_CHECK"
                name="legalChecked"
                checked={formik.values.legalChecked}
                onChange={formik.handleChange}
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
                disabled={!formik.values.legalChecked}
                type="submit"
                data-testid="REGISTER_BUTTON">
                Register
              </button>
            </div>
          </form>
        </div>
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
          font-weight: 900;
          margin: 1rem auto 4rem;
          font-family: var(--serif);
        }

        h2 {
          font-size: 1.25rem;
          line-height: 1.1;
          font-weight: 700;
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

        .legal-check-container {
          padding: 1rem 0;
          display: block;
          user-select: none;
        }

        input[type="checkbox"] {
          display: inline-block;
          margin-right: 1rem;
        }

        .tabs {
          background: var(--surface);
          box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
