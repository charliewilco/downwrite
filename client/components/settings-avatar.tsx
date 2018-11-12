import * as React from "react";
import { Formik, FormikProps, Form } from "formik";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { gradientPoints } from "../components/avatar";

let handleColorChange = (value, name) =>
  this.setState(({ colors }) => {
    colors[name] = value;

    return {
      colors
    };
  });

const SettingsAvatar: React.SFC<any> = () => (
  <Formik initialValues={{ colors: gradientPoints() }}>
    {({ values, handleChange }) => (
      <SettingsBlock title="Avatar">
        <Form>
          <GradientEditor
            name="colors"
            colors={values.colors}
            onColorChange={handleColorChange}
          />
        </Form>
      </SettingsBlock>
    )}
  </Formik>
);

export default SettingsAvatar;
