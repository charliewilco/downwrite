import * as React from "react";
import { Formik, FormikProps, Form } from "formik";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import LoginInput, { LoginInputContainer } from "./login-input";
import Button from "./button";
import { LocalSettingsSchema } from "../utils/validations";

interface ILocalSettings {
  fileExtension: string;
}

interface ISettingsLocalMarkdownProps {
  onSubmit: (settings: ILocalSettings) => void;
}

export default class SettingsLocalMarkdown extends React.Component<
  ISettingsLocalMarkdownProps,
  {}
> {
  onSubmit(values, actions) {
    this.props.onSubmit(values);
  }
  render() {
    return (
      <Formik
        initialValues={{ fileExtension: ".md" }}
        validationSchema={LocalSettingsSchema}
        onSubmit={this.onSubmit}>
        {({ values, handleChange }: FormikProps<ILocalSettings>) => (
          <SettingsBlock
            title="Local Settings"
            description="Settings only saved in your browser and won't sync across devices.">
            <Form>
              <LoginInputContainer>
                <LoginInput
                  label="File Extension"
                  name="fileExtension"
                  value={values.fileExtension}
                  onChange={handleChange}
                />
              </LoginInputContainer>
              <SettingsFormActions>
                <Button type="submit">Save</Button>
              </SettingsFormActions>
            </Form>
          </SettingsBlock>
        )}
      </Formik>
    );
  }
}
