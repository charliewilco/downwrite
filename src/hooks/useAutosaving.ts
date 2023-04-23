import { useInterval, useDataSource } from ".";

export function useAutosaving(
	duration: number = 5000,
	cb?: (...args: any[]) => void,
	message?: string
) {
	const dataSource = useDataSource();

	useInterval(duration, () => {
		if (cb) {
			dataSource.notifications.add(message || "Autosaving", true);
			cb();
		}
	});
}
