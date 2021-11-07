import { useRef } from "react";
import { useFormik } from "formik";
import { UIInput, UIInputContainer, UIInputError } from "./ui-input";
import { SettingsBlock, SettingsFormActions } from "./settings-block";
import { Button } from "./button";
import { useDataSource } from "@hooks/useDataSource";
import { LocalSettingsSchema } from "@utils/validations";
import { Fonts } from "@utils/default-styles";

interface ILocalSettings extends Record<string, string> {
  fileExtension: string;
  fontFamily: Fonts;
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

export function SettingsLocalMarkdown(): JSX.Element {
  const store = useDataSource();

  const initialValues = useRef<() => ILocalSettings>(() => {
    return {
      fileExtension: store.settings.fileExtension || ".md",
      fontFamily: (store.settings.editorFont || "DM Mono") as Fonts
    };
  });

  function onSubmit({ fileExtension, fontFamily }: ILocalSettings): void {
    store.settings.editorFont = fontFamily as Fonts;
    store.settings.fileExtension = fileExtension;

    store.settings.handleSettingsUpdate({ fileExtension, fontFamily });
  }

  const formik = useFormik<ILocalSettings>({
    initialValues: initialValues.current(),
    validationSchema: LocalSettingsSchema,
    onSubmit
  });

  return (
    <SettingsBlock
      title="Local Settings"
      description="Settings only saved in your browser and won't sync across devices.">
      <form onSubmit={formik.handleSubmit}>
        {LOCAL_SETTINGS_INPUTS.map((input, idx) => (
          <UIInputContainer key={idx} className="mb-4">
            <UIInput
              label={input.label}
              name={input.name}
              value={formik.values[input.name as keyof ILocalSettings]}
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
