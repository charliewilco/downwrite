import { IAppState, initialState } from "@reducers/app";

export type TokenContents = {
  user: string;
  name: string;
};

export const SECRET_KEY =
  process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

export function getInitialState(t?: TokenContents): IAppState {
  if (t) {
    return Object.assign(initialState, {
      me: {
        id: t.user,
        username: t.name
      }
    });
  }

  return initialState;
}
