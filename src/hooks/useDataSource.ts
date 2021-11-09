import { DownwriteUIState } from "src/data/store";
import type { IStoreContructor } from "src/data/types";
import { createContext, useContext, useEffect } from "react";

const DataSourceContext = createContext(new DownwriteUIState());

export const useDataSource = () => {
  return useContext(DataSourceContext);
};

export const useCheckAuth = () => {
  const dataSource = useDataSource();
  useEffect(() => {
    dataSource.graphql.isMe().then((value) => {
      dataSource.me.checkAuth(value);
    });
  }, [dataSource]);
};

export const useDataFactory = <T>(Store: IStoreContructor<T>): T => {
  return useContext(DataSourceContext).createConnectedStore(Store);
};
