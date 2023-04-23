import { useLayoutEffect, useEffect, useRef, useState, useCallback } from "react";

import { createPortal } from "react-dom";

export function useForceUpdate() {
	let [, dispatch] = useState<{}>(Object.create(null));
	return useCallback(() => {
		dispatch(Object.create(null));
	}, []);
}

function canUseDOM() {
	return !!(
		typeof window !== "undefined" &&
		window.document &&
		window.document.createElement
	);
}

export const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;

interface IPortalProps {
	type: string;
	containerRef?: React.RefObject<Node>;
}

export const Portal: React.FC<IPortalProps> = ({ type, children, containerRef }) => {
	let mountNode = useRef<HTMLDivElement | null>(null);
	let portalNode = useRef<HTMLElement | null>(null);

	const forceUpdate = useForceUpdate();

	useIsomorphicLayoutEffect(() => {
		if (!mountNode.current) return;

		let ownerDocument = mountNode.current!.ownerDocument;
		let body = containerRef?.current || ownerDocument.body;
		portalNode.current = ownerDocument?.createElement(type)!;
		body.appendChild(portalNode.current);
		forceUpdate();
		return () => {
			if (portalNode.current && body) {
				body.removeChild(portalNode.current);
			}
		};
	}, [type, forceUpdate, containerRef]);
	return portalNode.current ? (
		createPortal(children, portalNode.current)
	) : (
		<span ref={mountNode} />
	);
};
