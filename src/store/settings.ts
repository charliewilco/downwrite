import { DownwriteClient } from "@store/client";
import { IAppState } from "./store";
import { Fonts } from "@utils/default-styles";
import base64 from "base-64";

export interface ISettings {
  isDarkMode: boolean;
  fileExtension: string;
  editorFont: string;
}

export interface IUserFormValues {
  username: string;
  email: string;
}

export interface IPasswordSettings {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class GlobalSettings implements ISettings {
  isDarkMode = true;
  fileExtension = ".md";
  editorFont = Fonts.monospace;
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;
  }

  handleSettingsUpdate(values: { fileExtension: string; fontFamily: Fonts }) {
    this.editorFont = values.fontFamily;
    this.fileExtension = values.fileExtension;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  async update(settings: IUserFormValues) {
    try {
      return this.#client.updateSettings({
        settings: {
          username: settings.username,
          email: settings.email
        }
      });
    } catch (error) {
      this.#store.notifications.error(error.message);
    }
  }

  async changePassword(_: IPasswordSettings) {
    try {
      return this.#client.updatePassword(
        base64.encode(_.oldPassword),
        base64.encode(_.newPassword)
      );
    } catch (error) {
      this.#store.notifications.error(error.message, true);
    }
  }
}
