import { DownwriteUIState } from "@data/store";
import type { IStoreContructor } from "@data/types";
import { createContext, useContext, useEffect } from "react";

const DataSourceContext = createContext(new DownwriteUIState());

export const useDataSource = () => {
  return useContext(DataSourceContext);
};

export const useCheckAuth = () => {
  const dataSource = useDataSource();
  useEffect(() => {
    dataSource.me.checkAuth();
  }, [dataSource]);
};

export const useDataFactory = <T>(Store: IStoreContructor<T>): T => {
  return useContext(DataSourceContext).createConnectedStore(Store);
};
