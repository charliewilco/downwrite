import { createContext, useContext, useEffect } from "react";
import { useLocalObservable } from "mobx-react";
import { Store } from "./store";

const STORE = new Store();

const AppContext = createContext(STORE);

export const StoreConnector: React.FC = ({ children }) => {
  const store = useLocalObservable(() => STORE);
  useEffect(() => {
    store.graphql.isMe().then((value) => {
      store.me.checkAuth(value);
    });
  }, []);

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

export const useStore = () => {
  const context = useContext(AppContext);
  return useLocalObservable(() => context);
};
