import { createContext, useContext, useEffect } from "react";
import { useLocalObservable } from "mobx-react";
import { Store } from "./store";

const AppContext = createContext(new Store());

export const AppProvider: React.FC = ({ children }) => {
  const store = useLocalObservable(() => new Store());
  useEffect(() => {
    store.graphql.isMe().then((value) => {
      store.me.checkAuth(value);
    });
  }, []);

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

export const useStore = () => useContext(AppContext);
