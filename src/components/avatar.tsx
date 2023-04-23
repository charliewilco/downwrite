import React, { useMemo } from "react";
import { AvatarColors, Gradient } from "@shared/gradients";

export interface IPointedGradientColors {
	a: string;
	b: string;
}

export const gradientPoints = (colors: Gradient = AvatarColors) => ({
	a: colors[0],
	b: colors[1]
});

export interface IAvatarCircleProps {
	colors: IPointedGradientColors;
	centered?: boolean;
	size?: number;
}

interface IAvatarProps {
	colors: Gradient;
	size?: number;
	centered?: boolean;
}

export const Avatar: React.VFC<IAvatarProps> = (props: IAvatarProps) => {
	const colors = useMemo(() => gradientPoints(props.colors), [props.colors]);

	return (
		<div
			className={props.centered && "centered"}
			role="img"
			aria-label="Gradient in a circle to represent a user">
			<style jsx>
				{`
					[role="img"] {
						border-radius: 100%;
						width: 3rem;
						height: 3rem;
						background: linear-gradient(135deg, ${colors.a} 10%, ${colors.b} 100%);
					}

					.centered {
						margin: 0 auto 1rem;
					}
				`}
			</style>
		</div>
	);
};
