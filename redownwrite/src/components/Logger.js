import { Component, createElement as h } from 'react'
import __IS_DEV__ from '../utils/dev'

const Null = () => null

export default class Logger extends Component {
  static defaultProps = {
    type: 'log',
    clear: false
  }

  logger = console[this.props.type]

  componentDidMount() {
    if (__IS_DEV__) {
      const { value } = this.props
      this.logger(value)
    }
  }

  componentWillReceiveProps({ value, clear }) {
    if (__IS_DEV__) {
      this.logger(value)

      clear && console.clear()
    }
  }

  render() {
    return h(Null)
  }
}
