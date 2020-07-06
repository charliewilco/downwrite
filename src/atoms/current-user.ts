import { atom, useRecoilState } from "recoil";
import { useCallback } from "react";

export interface ICurrentUserState {
  username?: string;
  id?: string;
}

export const meAtom = atom<ICurrentUserState>({
  key: "me",
  default: {
    username: undefined,
    id: undefined
  }
});

export function useCurrentUser() {
  const [me, setMe] = useRecoilState(meAtom);

  const onCurrentUserLogout = useCallback(() => {
    setMe({ username: undefined, id: undefined });
  }, []);

  const onCurrentUserLogin = useCallback((username: string, id: string) => {
    setMe({ username, id });
  }, []);

  return [me, { onCurrentUserLogin, onCurrentUserLogout }] as const;
}
