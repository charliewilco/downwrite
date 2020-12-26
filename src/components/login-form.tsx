import { useFormik } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import { Button } from "./button";
import { useLoginFns, ILoginValues } from "../hooks";
import { LoginFormSchema } from "../utils/validations";

/**
 *
 * Login functions
 *
 */
export default function Login(): JSX.Element {
  const { onLoginSubmit } = useLoginFns();

  const { values, handleSubmit, handleChange, errors } = useFormik<ILoginValues>({
    initialValues: {
      user: "",
      password: ""
    },
    validationSchema: LoginFormSchema,
    onSubmit: onLoginSubmit
  });

  return (
    <form onSubmit={handleSubmit}>
      <UIInputContainer>
        <UIInput
          testID="LOGIN_USERNAME"
          placeholder="user@email.com"
          label="Username or Email"
          name="user"
          autoComplete="username"
          value={values.user}
          onChange={handleChange}
        />
        {errors.user && <UIInputError>{errors.user}</UIInputError>}
      </UIInputContainer>
      <UIInputContainer>
        <UIInput
          testID="LOGIN_PASSWORD"
          placeholder="*********"
          name="password"
          label="Password"
          value={values.password}
          type="password"
          autoComplete="current-password"
          onChange={handleChange}
        />
        {errors.password && <UIInputError>{errors.password}</UIInputError>}
      </UIInputContainer>
      <div>
        <UIInputContainer className="flex justify-end">
          <Button type="submit" id="RELOGIN_BUTTON" data-testid="RELOGIN_BUTTON">
            Login
          </Button>
        </UIInputContainer>
      </div>
    </form>
  );
}
