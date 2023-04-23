import { useEffect } from "react";

type Callback = () => void;

export function useTimeout(interval: number = 500, cb?: Callback): void {
	useEffect(() => {
		if (cb) {
			const t = setTimeout(() => {
				cb();
			}, interval);

			return function cleanup() {
				clearTimeout(t);
			};
		}
	}, [interval, cb]);
}

export function useInterval(interval: number = 500, cb?: Callback): void {
	useEffect(() => {
		if (cb) {
			const t = setInterval(() => {
				cb();
			}, interval);

			return function cleanup() {
				clearInterval(t);
			};
		}
	}, [interval, cb]);
}
