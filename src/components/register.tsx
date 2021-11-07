import { useFormik } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import { Button } from "./button";
import LegalBoilerplate from "./legal-boilerplate";
import { RegisterFormSchema as validationSchema } from "../utils/validations";
import { useStore } from "@reducers/app";
import { IRegisterValues } from "@reducers/me";

const REGISTER_INPUTS = [
  {
    name: "username",
    label: "Username",
    placeholder: "Try for something unique",
    type: "text",
    autoComplete: "username"
  },
  {
    name: "email",
    type: "email",
    placeholder: "mail@email.com",
    label: "Email",
    autoComplete: "email"
  },
  {
    name: "password",
    type: "password",
    placeholder: "*********",
    label: "Password",
    autoComplete: "current-password"
  }
] as const;

const initialValues: IRegisterValues = {
  legalChecked: false,
  username: "",
  password: "",
  email: ""
};

interface ILoginContainer {
  onSuccess(): void;
}

export default function RegisterForm(props: ILoginContainer): JSX.Element {
  const store = useStore();

  const formik = useFormik<IRegisterValues>({
    initialValues,
    validationSchema,
    validateOnChange: false,
    onSubmit(values) {
      store.me.register(values).then(() => props.onSuccess());
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        {REGISTER_INPUTS.map((input) => (
          <UIInputContainer key={input.name}>
            <UIInput
              type={input.type}
              placeholder={input.placeholder}
              label={input.label}
              autoComplete={input.autoComplete}
              {...formik.getFieldProps(input.name)}
            />
            {formik.errors[input.name] && (
              <UIInputError>{formik.errors[input.name]}</UIInputError>
            )}
          </UIInputContainer>
        ))}
      </div>
      <LegalBoilerplate
        name="legalChecked"
        checked={formik.values.legalChecked}
        onChange={formik.handleChange}
      />
      <div className="text-right">
        <UIInputContainer className="text-right">
          <Button
            disabled={!formik.values.legalChecked}
            type="submit"
            data-testid="REGISTER_BUTTON">
            Register
          </Button>
        </UIInputContainer>
      </div>
    </form>
  );
}
