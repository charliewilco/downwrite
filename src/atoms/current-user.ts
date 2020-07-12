import { atom, useRecoilState } from "recoil";
import { useCallback, useEffect } from "react";
import Cookies from "universal-cookie";
import decode from "jwt-decode";
import { TokenContents } from "../lib/token";

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

  return [
    { ...me, authed: !!me.username && !!me.id },
    { onCurrentUserLogin, onCurrentUserLogout }
  ] as const;
}

export function useAuthCheck() {
  const [state, { onCurrentUserLogin }] = useCurrentUser();
  useEffect(() => {
    console.log("Checking auth on client");
    if (!state.authed) {
      const cookies = new Cookies();
      const m = cookies.get("DW_TOKEN");
      const x = cookies.getAll();
      console.log(m, x, state);

      if (m) {
        const d = decode<TokenContents>(m);

        onCurrentUserLogin(d.name, d.user);
      }
    }
  }, []);
}
