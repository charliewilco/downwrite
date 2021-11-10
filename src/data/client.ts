import { GraphQLClient } from "graphql-request";
import Cookie from "universal-cookie";
import { TOKEN_NAME } from "@shared/constants";

import { getSdk } from "../__generated__/client";

import type {
  ICreateEntryMutationVariables,
  ICreateUserMutationVariables,
  ILoginUserMutationVariables,
  IUpdateEntryMutationVariables,
  IUpdateUserSettingsMutationVariables
} from "../__generated__/client";

export class DownwriteClient extends GraphQLClient {
  cookies = new Cookie();
  constructor(options?: RequestInit) {
    super("/api/graphql", options);

    this._checkToken();

    this.cookies.addChangeListener((options) => {
      if (options.name === TOKEN_NAME && options.value) {
        this.setToken(options.value);
      }
    });
  }

  private _checkToken() {
    const token = this.cookies.get(TOKEN_NAME);

    if (token) {
      this.setToken(token);
    }
  }

  setToken(token: string) {
    this.setHeader("Authorization", token);
    this.cookies.set(TOKEN_NAME, token);
  }

  allPosts() {
    return getSdk(this).AllPosts();
  }

  isMe() {
    return getSdk(this).IsMe();
  }

  edit(id: string) {
    return getSdk(this).Edit({ id });
  }

  preview(id: string) {
    return getSdk(this).Preview({ id });
  }

  userDetails() {
    return getSdk(this).UserDetails();
  }

  updateEntry(variables: IUpdateEntryMutationVariables) {
    return getSdk(this).UpdateEntry(variables);
  }

  createEntry(variables: ICreateEntryMutationVariables) {
    return getSdk(this).CreateEntry(variables);
  }

  removeEntry(id: string) {
    return getSdk(this).RemoveEntry({ id });
  }

  loginUser(variables: ILoginUserMutationVariables) {
    return getSdk(this).LoginUser(variables);
  }

  createUser(variables: ICreateUserMutationVariables) {
    return getSdk(this).CreateUser(variables);
  }

  updateSettings(variables: IUpdateUserSettingsMutationVariables) {
    return getSdk(this).UpdateUserSettings(variables);
  }

  updatePassword(current: string, newPassword: string) {
    return getSdk(this).UpdatePassword({
      current,
      newPassword
    });
  }
}
