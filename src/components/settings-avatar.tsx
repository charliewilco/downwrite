import * as React from "react";
import { useFormik } from "formik";
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

export default function SettingsAvatar(): JSX.Element {
  const { values, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      colors: gradientPoints()
    },
    onSubmit: () => null
  });
  return (
    <SettingsBlock title="Avatar">
      <form onSubmit={handleSubmit}>
        <GradientEditor
          colors={values.colors}
          onColorChange={colors => setFieldValue("colors", colors)}
        />
      </form>
    </SettingsBlock>
  );
}
