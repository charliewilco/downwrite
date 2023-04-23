import { Avatar } from "@components/avatar";
import { Gradient } from "@shared/gradients";

interface IUserBlockProps {
	name: string;
	border: boolean;
	colors: Gradient;
}

export const UserBlock: React.VFC<IUserBlockProps> = (props) => {
	return (
		<div>
			<Avatar centered colors={props.colors} />
			<b>{props.name}</b>
			<style jsx>
				{`
					div {
						padding: 2rem 0.5rem;
						max-width: 100%;
						position: relative;
						text-align: center;
						border-bottom: ${props.border ? "1px" : 0} solid var(--onyx-200);
					}
					b {
						display: inline-block;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				`}
			</style>
		</div>
	);
};

interface IAuthorProps {
	name: string;
	colors: Gradient;
}

export const AuthorBlock = (props: IAuthorProps): JSX.Element => {
	return (
		<div>
			<Avatar colors={props.colors} />
			<h6>{props.name}</h6>

			<style jsx>{`
				h6 {
					font-family: var(--sans-serif);
					font-size: 0.875rem;
					margin-left: 1rem;
				}

				div {
					display: flex;
					align-items: center;
				}
			`}</style>
		</div>
	);
};
