import Head from "next/head";
import useSWR from "swr";
import { useRef, useReducer } from "react";
import { useFormik } from "formik";
import { MixedCheckbox } from "@reach/checkbox";
import { UIInput, UIInputContainer, UIInputError } from "@components/ui-input";
import { Button } from "@components/button";
import { Loading } from "@components/loading";
import { PageTitle } from "@components/page-title";
import { useDataSource } from "@hooks/useDataSource";
import {
  UserSettingsSchema,
  UpdatePasswordSchema,
  LocalSettingsSchema
} from "@utils/validations";
import { Fonts } from "@utils/default-styles";
import type { IUserFormValues } from "@store/base/settings";

interface ILocalSettings {
  fileExtension: string;
  fontFamily: Fonts;
}

interface IPasswordSettings {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ISettingsFormActionsProps {
  split?: boolean;
  className?: string;
}

export const SettingsFormActions: React.FC<ISettingsFormActionsProps> = (props) => {
  // const className = classNames(
  //   "mt-4 flex justify-end",
  //   props.split && "justify-between",
  //   props.className
  // );
  return <div className={props.className}>{props.children}</div>;
};

const SettingsPage = () => {
  const [isOpen, onToggleOpen] = useReducer((prev: boolean) => !prev, false);
  const store = useDataSource();
  const { error, data } = useSWR(["settings"], () => store.graphql.userDetails());

  const initialMarkdownValues = useRef<() => ILocalSettings>(() => ({
    fileExtension: store.settings.fileExtension || ".md",
    fontFamily: (store.settings.editorFont || "DM Mono") as Fonts
  }));

  const markdownFormik = useFormik<ILocalSettings>({
    initialValues: initialMarkdownValues.current(),
    validationSchema: LocalSettingsSchema,
    onSubmit(values) {
      store.settings.editorFont = values.fontFamily as Fonts;
      store.settings.fileExtension = values.fileExtension;

      store.settings.handleSettingsUpdate(values);
    }
  });

  const passwordFormik = useFormik<IPasswordSettings>({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    async onSubmit(_: IPasswordSettings, actions) {
      await actions.validateForm();
      await store.settings.changePassword(_);
    },
    validationSchema: UpdatePasswordSchema
  });

  const userFormik = useFormik<IUserFormValues>({
    initialValues: { ...data?.settings },
    onSubmit(values) {
      store.settings.update(values);
    },
    validationSchema: UserSettingsSchema
  });

  const loading = !data;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="outer" data-testid="SETTINGS_CONTAINER">
      <Head>
        <title>User Settings</title>
      </Head>
      <header>
        <PageTitle>Settings</PageTitle>
      </header>

      <div className="usage">
        <dl>
          <div className="stat">
            <dt>Total Entries</dt>
            <dd>{data?.me.usage.entryCount}</dd>
          </div>
          <div className="stat">
            <dt>Public Entries</dt>
            <dd>{data?.me.usage.publicEntries}</dd>
          </div>
          <div className="stat">
            <dt>Private Entries</dt>
            <dd>{data?.me.usage.privateEntries}</dd>
          </div>
        </dl>
      </div>

      <section>
        <div className="info">
          <h4>User Settings</h4>
        </div>
        <div className="form">
          <form onSubmit={userFormik.handleSubmit}>
            <UIInputContainer>
              <UIInput
                testID="SETTINGS_USERNAME_INPUT"
                placeholder="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={userFormik.values.username}
                onChange={userFormik.handleChange}
              />
              {userFormik.errors.username && (
                <UIInputError>{userFormik.errors.username}</UIInputError>
              )}
            </UIInputContainer>
            <UIInputContainer>
              <UIInput
                testID="SETTINGS_EMAIL_INPUT"
                placeholder="user@email.com"
                label="Email"
                autoComplete="email"
                type="email"
                name="email"
                value={userFormik.values.email}
                onChange={userFormik.handleChange}
              />
              {userFormik.errors.email && (
                <UIInputError>{userFormik.errors.email}</UIInputError>
              )}
            </UIInputContainer>
            <SettingsFormActions>
              <Button type="submit" disabled={userFormik.isSubmitting}>
                Save
              </Button>
            </SettingsFormActions>
          </form>
        </div>
      </section>

      <section>
        <div className="info">
          <h4>Password</h4>
        </div>
        <div className="form">
          <form onSubmit={passwordFormik.handleSubmit}>
            <input type="hidden" name="username" value={data.settings.username} />
            <UIInputContainer>
              <UIInput
                label="Old Password"
                name="oldPassword"
                type={!isOpen ? "password" : "text"}
                placeholder="*********"
                value={passwordFormik.values.oldPassword}
                onChange={passwordFormik.handleChange}
                autoComplete="current-password"
              />
              {passwordFormik.errors.oldPassword && (
                <UIInputError>{passwordFormik.errors.oldPassword}</UIInputError>
              )}
            </UIInputContainer>
            <UIInputContainer>
              <UIInput
                label="New Password"
                name="newPassword"
                type={!isOpen ? "password" : "text"}
                placeholder="*********"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                autoComplete="new-password"
              />
              {passwordFormik.errors.newPassword && (
                <UIInputError>{passwordFormik.errors.newPassword}</UIInputError>
              )}
            </UIInputContainer>

            <UIInputContainer>
              <UIInput
                label="Confirm Your New Password"
                name="confirmPassword"
                type={!isOpen ? "password" : "text"}
                placeholder="*********"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                autoComplete="new-password"
              />
              {passwordFormik.errors.confirmPassword && (
                <UIInputError>{passwordFormik.errors.confirmPassword}</UIInputError>
              )}
            </UIInputContainer>

            <SettingsFormActions split>
              <div>
                <label>
                  <MixedCheckbox
                    name="Password Hidden"
                    checked={isOpen}
                    onChange={onToggleOpen}
                  />
                  <span>{!isOpen ? "Values hidden" : "Values shown"}</span>
                </label>
              </div>
              <Button type="submit" disabled={passwordFormik.isSubmitting}>
                Save
              </Button>
            </SettingsFormActions>
          </form>
        </div>
      </section>

      <section>
        <div className="info">
          <h4>Local Settings</h4>
          <p>Settings only saved in your browser and won't sync across devices.</p>
        </div>
        <div className="form">
          <form onSubmit={markdownFormik.handleSubmit}>
            <UIInputContainer>
              <UIInput
                label="File Extension"
                {...markdownFormik.getFieldProps("fileExtension")}
              />
              {markdownFormik.errors["fileExtension"] && (
                <UIInputError>{markdownFormik.errors["fileExtension"]}</UIInputError>
              )}
            </UIInputContainer>
            <UIInputContainer>
              <UIInput
                label="Editor Font"
                {...markdownFormik.getFieldProps("fontFamily")}
              />
              {markdownFormik.errors["fontFamily"] && (
                <UIInputError>{markdownFormik.errors["fontFamily"]}</UIInputError>
              )}
            </UIInputContainer>
            <SettingsFormActions>
              <Button type="submit" disabled={markdownFormik.isSubmitting}>
                Save
              </Button>
            </SettingsFormActions>
          </form>
        </div>
      </section>

      <style jsx>{`
        .outer {
          max-width: 56rem;
          margin-left: auto;
          margin-right: auto;
        }

        h4 {
          font-size: 1.25rem;
          margin-bottom: 2rem;
        }

        dl,
        section {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(12, minmax(0, 1fr));
        }

        .usage,
        section {
          margin-bottom: 2rem;
        }

        section {
          padding: 1rem;
        }

        section,
        .stat {
          box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
          background: var(--surface);
        }

        dt {
          font-size: 0.875rem;
          letter-spacing: 0.02em;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }

        dd {
          font-family: var(--monospace);
          font-size: 3rem;
          line-height: 1;
          font-weight: 300;
          text-align: right;
        }

        .stat {
          grid-column: span 4 / span 4;
          padding: 1rem;
        }

        .info {
          grid-column: span 3 / span 3;
        }

        .form {
          grid-column: span 9 / span 9;
        }

        p {
          font-size: small;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
