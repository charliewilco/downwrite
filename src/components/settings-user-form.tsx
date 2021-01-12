import { useFormik } from "formik";
import { useUpdateSettings, IUserFormValues } from "@hooks/useUpdateSettings";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { Button } from "./button";
import { UserSettingsSchema as validationSchema } from "@utils/validations";

interface ISettingsUserForm {
  user: IUserFormValues;
}

export default function SettingsUser(props: ISettingsUserForm): JSX.Element {
  const onSubmit = useUpdateSettings();

  const formik = useFormik<IUserFormValues>({
    initialValues: { ...props.user },
    onSubmit,
    validationSchema
  });

  return (
    <SettingsBlock title="User Settings">
      <form onSubmit={formik.handleSubmit}>
        <UIInputContainer className="mb-4">
          <UIInput
            testID="SETTINGS_USERNAME_INPUT"
            placeholder="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={formik.values.username}
            onChange={formik.handleChange}
          />
          {formik.errors.username && (
            <UIInputError>{formik.errors.username}</UIInputError>
          )}
        </UIInputContainer>
        <UIInputContainer className="mb-4">
          <UIInput
            testID="SETTINGS_EMAIL_INPUT"
            placeholder="user@email.com"
            label="Email"
            autoComplete="email"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          {formik.errors.email && <UIInputError>{formik.errors.email}</UIInputError>}
        </UIInputContainer>
        <SettingsFormActions>
          <Button type="submit" disabled={formik.isSubmitting}>
            Save
          </Button>
        </SettingsFormActions>
      </form>
    </SettingsBlock>
  );
}
