import { forwardRef } from "react";

export const StickyContainer = forwardRef<
	HTMLDivElement,
	React.PropsWithChildren<{
		debug?: boolean;
	}>
>((props, ref) => {
	return (
		<div ref={ref}>
			{props.children}

			<style jsx>{`
				div {
					z-index: 100;
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					padding: 1rem 0;
					width: 100%;

					max-width: 56rem;

					margin: 0 auto;
					background: rgba(19, 20, 21, 0.5);
					-webkit-backdrop-filter: saturate(180%) blur(20px);
					backdrop-filter: saturate(180%) blur(20px);
				}
			`}</style>
		</div>
	);
});

StickyContainer.displayName = "StickyContainer";
