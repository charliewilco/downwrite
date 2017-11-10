import React from 'react'
import { Block } from 'glamor/jsxstyle'

class RandomColor extends React.Component {
	state = {
		a: null,
		b: null
	}

	componentWillMount() {
		this.setState({
			a: `#FEB692`,
			b: `#EA5455`
		})
	}

	shouldComponentUpdate() {}

	render() {
		return this.props.children(this.state.a, this.state.b)
	}
}

export default () => (
	<RandomColor>
		{(A, B) => (
			<Block
				borderRadius={32}
				width={32}
				height={32}
				background={`linear-gradient(135deg, ${A} 10%, ${B} 100%)`}
				margin="auto"
			/>
		)}
	</RandomColor>
)
