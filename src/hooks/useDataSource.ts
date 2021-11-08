import { Store } from "@store/store";
import type { IStoreContructor } from "@store/types";
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

export const useDataFactory = <T>(Store: IStoreContructor<T>): T => {
  return useContext(AppContext).createConnectedStore(Store);
};
