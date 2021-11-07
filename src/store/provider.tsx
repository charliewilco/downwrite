import { createContext, useContext, useEffect } from "react";
import { Store } from "./store";

const STORE = new Store();

const AppContext = createContext(STORE);

export const StoreConnector: React.FC = ({ children }) => {
  useEffect(() => {
    STORE.graphql.isMe().then((value) => {
      STORE.me.checkAuth(value);
    });
  }, []);

  return <AppContext.Provider value={STORE}>{children}</AppContext.Provider>;
};

export const useDataSource = () => {
  return useContext(AppContext);
};
