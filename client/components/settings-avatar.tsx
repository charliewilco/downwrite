import * as React from "react";
import { Formik, Form } from "formik";
import SettingsBlock from "./settings-block";
import GradientEditor from "./gradient-editor";
import { gradientPoints } from "../components/avatar";

// let handleColorChange = (value, name) =>
//   this.setState(({ colors }) => {
//     colors[name] = value;

//     return {
//       colors
//     };
//   });

const SettingsAvatar: React.SFC<any> = () => (
  <Formik initialValues={{ colors: gradientPoints() }} onSubmit={console.log}>
    {({ values, handleChange, setFieldValue }) => (
      <SettingsBlock title="Avatar">
        <Form>
          <GradientEditor
            colors={values.colors}
            onColorChange={colors => setFieldValue("colors", colors)}
          />
        </Form>
      </SettingsBlock>
    )}
  </Formik>
);

export default SettingsAvatar;
