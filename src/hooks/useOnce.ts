import { useEffect, useRef } from "react";

export function useOnce(
	effectCallback: React.EffectCallback,
	dep: React.DependencyList
): void {
	const loaded = useRef(false);
	useEffect(loaded ? () => {} : effectCallback, dep);
}
