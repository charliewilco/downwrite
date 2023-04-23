import { DownwriteUIState } from "@data/store";
import type { IStoreContructor } from "@data/types";
import { createContext, useContext } from "react";
import { useInterval } from "./useTimers";

const DataSourceContext = createContext(new DownwriteUIState());

export const useDataSource = () => {
	return useContext(DataSourceContext);
};

export const useCheckAuth = () => {
	const dataSource = useDataSource();
	useInterval(60 * 2 * 1000, () => dataSource.auth.check());
};

export const useDataFactory = <T>(Store: IStoreContructor<T>): T => {
	return useContext(DataSourceContext).createConnectedStore(Store);
};
