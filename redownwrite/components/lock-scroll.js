import { Component } from 'react'

export default class extends Component {
  componentDidMount() {
    if (document) {
      if (document.body) {
        document.body.classList.add('__noScroll')
      }
    }
  }

  componentWillUnmount() {
    if (document) {
      if (document.body) {
        document.body.classList.remove('__noScroll')
      }
    }
  }

  render() {
    return this.props.children
  }
}
