import { useFormik } from "formik";
import SettingsBlock from "./settings-block";
import GradientEditor from "./gradient-editor";
import { gradientPoints } from "../components/avatar";

export default function SettingsAvatar(): JSX.Element {
  const { values, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      colors: gradientPoints()
    },
    onSubmit: () => {}
  });
  return (
    <SettingsBlock title="Avatar">
      <form onSubmit={handleSubmit}>
        <GradientEditor
          colors={values.colors}
          onColorChange={(colors) => setFieldValue("colors", colors)}
        />
      </form>
    </SettingsBlock>
  );
}
