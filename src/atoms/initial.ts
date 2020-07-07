import { useCallback } from "react";
import { MutableSnapshot } from "recoil";
import {
  UINotificationMessage,
  NotificationType,
  notificationsAtom
} from "./notifications";
import { meAtom } from "./current-user";
import { settingsAtom } from "./settings";
import { Fonts } from "../utils/default-styles";

export interface IInitialState {
  userId: string;
  username: string;
}

export function useInitialRecoilSnapshot(initialState?: IInitialState) {
  console.log("INITIAL RECOIL STATE", initialState);
  return useCallback(
    (m: MutableSnapshot) => {
      m.set(notificationsAtom, [
        new UINotificationMessage("Something", NotificationType.WARNING, false)
      ]);
      m.set(settingsAtom, {
        isDarkMode: true,
        fileExtension: ".md",
        editorFont: Fonts.monospace
      });
      if (initialState?.username && initialState?.userId) {
        m.set(meAtom, {
          username: initialState.username,
          id: initialState.userId
        });
      }
    },
    [initialState]
  );
}
