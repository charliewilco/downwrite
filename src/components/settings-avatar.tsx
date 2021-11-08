import { useFormik } from "formik";
import { GradientEditor } from "./gradient-editor";
import { gradientPoints } from "../components/avatar";

export function SettingsAvatar(): JSX.Element {
  const { values, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      colors: gradientPoints()
    },
    onSubmit: () => {}
  });
  return (
    <form onSubmit={handleSubmit}>
      <GradientEditor
        colors={values.colors}
        onColorChange={(colors) => setFieldValue("colors", colors)}
      />
    </form>
  );
}
