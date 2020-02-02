import * as React from "react";
import { useFormik, FormikHelpers } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { Button } from "./button";
import { LocalSettingsSchema } from "../utils/validations";
import { LocalUISettings, ILocalUISettings } from "./local-ui-settings";
import { StringTMap } from "../utils/types";

interface ILocalSettings extends StringTMap<string> {
  fileExtension: string;
  fontFamily: string;
}

const LOCAL_SETTINGS_INPUTS = [
  {
    label: "File Extension",
    name: "fileExtension"
  },
  {
    label: "Editor Font",
    name: "fontFamily"
  }
];

export enum LocalSettings {
  EXTENSION = "DW_FILE_EXTENSION",
  FONT = "DW_EDITOR_FONT"
}

export default function SettingsLocalMarkdown(): JSX.Element {
  const {
    actions: { updateFont }
  } = React.useContext<ILocalUISettings>(LocalUISettings);

  const [initialValues, setInitialValues] = React.useState<ILocalSettings>({
    fileExtension: ".md",
    fontFamily: "SF Mono"
  });

  function onSubmit(
    { fileExtension, fontFamily }: ILocalSettings,
    helpers: FormikHelpers<ILocalSettings>
  ): void {
    localStorage.setItem(LocalSettings.EXTENSION, fileExtension);
    localStorage.setItem(LocalSettings.FONT, fontFamily);

    updateFont(fontFamily);

    if (
      localStorage.getItem(LocalSettings.EXTENSION) === fileExtension &&
      localStorage.getItem(LocalSettings.FONT) === fontFamily
    ) {
      helpers.setSubmitting(false);
    }
  }

  React.useEffect(() => {
    let fileExtension =
      localStorage.getItem(LocalSettings.EXTENSION) || initialValues.fileExtension;
    let fontFamily =
      localStorage.getItem(LocalSettings.FONT) || initialValues.fontFamily;

    setInitialValues({ fileExtension, fontFamily });
  }, []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: LocalSettingsSchema,
    onSubmit
  });

  return (
    <SettingsBlock
      title="Local Settings"
      description="Settings only saved in your browser and won't sync across devices.">
      <form onSubmit={formik.handleSubmit}>
        {LOCAL_SETTINGS_INPUTS.map((input, idx) => (
          <UIInputContainer key={idx}>
            <UIInput
              label={input.label}
              name={input.name}
              value={formik.values[input.name]}
              onChange={formik.handleChange}
            />
            {formik.errors[input.name] && (
              <UIInputError>{formik.errors[input.name]}</UIInputError>
            )}
          </UIInputContainer>
        ))}
        <SettingsFormActions>
          <Button type="submit" disabled={formik.isSubmitting}>
            Save
          </Button>
        </SettingsFormActions>
      </form>
    </SettingsBlock>
  );
}
