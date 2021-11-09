import { DownwriteClient } from "@data/client";
import type { IAppState } from "@data/types";
import base64 from "base-64";

export interface ISettings {
  isDarkMode: boolean;
  fileExtension: string;
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

export enum LocalSettings {
  EXTENSION = "DW_FILE_EXTENSION"
}

export class GlobalSettings implements ISettings {
  isDarkMode = true;
  fileExtension = ".md";
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;
  }

  handleSettingsUpdate(values: { fileExtension: string }) {
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
