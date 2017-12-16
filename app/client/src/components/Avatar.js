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

	render() {
		return this.props.children(this.state.a, this.state.b)
	}
}

export default () => (
	<RandomColor>
		{(A, B) => (
			<Block
				borderRadius={48}
				width={48}
				height={48}
				background={`linear-gradient(135deg, ${A} 10%, ${B} 100%)`}
				marginLeft="auto"
				marginRight="auto"
				marginBottom={16}
			/>
		)}
	</RandomColor>
)
