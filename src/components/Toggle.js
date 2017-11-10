import { Component } from 'react'

export default class extends Component {
	static defaultProps = {
		defaultOpen: false
	}

	state = {
		open: this.props.defaultOpen
	}

	toggle = () => this.setState(({ open }) => ({ open: !open }))

	render() {
		return this.props.children(this.state.open, this.toggle)
	}
}
