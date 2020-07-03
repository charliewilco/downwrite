import { atom, useRecoilState } from "recoil";
import produce from "immer";
import { useCallback } from "react";
import * as DefaultStyles from "../utils/default-styles";

export interface ISettings {
  isDarkMode: boolean;
  fileExtension: string;
  editorFont: string;
}

export const settingsAtom = atom<ISettings>({
  key: "settings",
  default: {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: DefaultStyles.Fonts.monospace
  }
});

export function useSettings() {
  const [settings, setSettings] = useRecoilState(settingsAtom);

  const toggleDarkMode = useCallback((mode?: boolean) => {
    setSettings(
      produce<(s: ISettings) => void>(draft => {
        draft.isDarkMode = mode || !draft.isDarkMode;
      })
    );
  }, []);

  const updateFileExtension = useCallback((extension: string) => {
    setSettings(settings => ({ ...settings, fileExtension: extension }));
  }, []);

  const updateEditorFont = useCallback((fontName: string) => {
    setSettings(settings => ({ ...settings, editorFont: fontName }));
  }, []);

  return [
    settings,
    {
      toggleDarkMode,
      updateEditorFont,
      updateFileExtension
    }
  ] as const;
}
