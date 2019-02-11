import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form, FormikActions } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import Button from "./button";
import { LocalSettingsSchema } from "../utils/validations";
import { LocalUISettings, ILocalUISettings } from "./local-ui-settings";

export interface StringTMap<T> {
  [key: string]: T;
}

interface ILocalSettings extends StringTMap<string> {
  fileExtension: string;
  fontFamily: string;
}

const initialValues = {
  fileExtension: ".md",
  fontFamily: "SF Mono"
};

export default class SettingsLocalMarkdown extends React.Component<
  {},
  { initialValues: ILocalSettings }
> {
  public readonly state = { initialValues };

  public static contextType: React.Context<ILocalUISettings> = LocalUISettings;

  private onSubmit = (
    values: ILocalSettings,
    actions: FormikActions<ILocalSettings>
  ): void => {
    localStorage.setItem("DW_FILE_EXTENSION", values.fileExtension);
    localStorage.setItem("DW_EDITOR_FONT", values.fontFamily);

    this.context.actions.updateFont(values.fontFamily);

    if (
      localStorage.getItem("DW_FILE_EXTENSION") === values.fileExtension &&
      localStorage.getItem("DW_EDITOR_FONT") === values.fontFamily
    ) {
      actions.setSubmitting(false);
    }
  };

  public componentDidMount(): void {
    let fileExtension =
      localStorage.getItem("DW_FILE_EXTENSION") || initialValues.fileExtension;
    let fontFamily =
      localStorage.getItem("DW_EDITOR_FONT") || initialValues.fontFamily;

    this.setState({ initialValues: { fileExtension, fontFamily } });
  }

  private inputs = [
    {
      label: "File Extension",
      name: "fileExtension"
    },
    {
      label: "Editor Font",
      name: "fontFamily"
    }
  ];

  public render(): JSX.Element {
    return (
      <Formik
        enableReinitialize
        initialValues={this.state.initialValues}
        validationSchema={LocalSettingsSchema}
        onSubmit={this.onSubmit}>
        {({ values, handleChange, isSubmitting }: FormikProps<ILocalSettings>) => (
          <SettingsBlock
            title="Local Settings"
            description="Settings only saved in your browser and won't sync across devices.">
            <Form>
              {this.inputs.map((input, idx) => (
                <UIInputContainer key={idx}>
                  <UIInput
                    label={input.label}
                    name={input.name}
                    value={values[input.name]}
                    onChange={handleChange}
                  />
                  <ErrorMessage name={input.name} component={UIInputError} />
                </UIInputContainer>
              ))}
              <SettingsFormActions>
                <Button type="submit" disabled={isSubmitting}>
                  Save
                </Button>
              </SettingsFormActions>
            </Form>
          </SettingsBlock>
        )}
      </Formik>
    );
  }
}
