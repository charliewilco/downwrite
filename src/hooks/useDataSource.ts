import { Store } from "@store/store";
import { createContext, useContext, useEffect } from "react";

const AppContext = createContext(new Store());

export const useDataSource = () => {
  return useContext(AppContext);
};

export const useCheckAuth = () => {
  const store = useDataSource();
  useEffect(() => {
    store.graphql.isMe().then((value) => {
      store.me.checkAuth(value);
    });
  }, []);
};
