import * as React from 'react'

export default class LockScroll extends React.Component {
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
