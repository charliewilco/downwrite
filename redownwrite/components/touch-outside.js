// @flow
import React, { Fragment, Component, type Element } from 'react'
import { findDOMNode } from 'react-dom'

const addListeners = (el: Document, s: string, fn: Function) =>
  s.split(' ').forEach(e => el.addEventListener(e, fn, false))

const rmListeners = (el: Document, s: string, fn: Function) =>
  s.split(' ').forEach(e => el.removeEventListener(e, fn, false))

// TODO: Should blur child
export default class TouchOutside extends Component<{
  onChange: Function,
  children: Element<any>
}> {
  static displayName = 'TouchOutside'

  componentDidMount() {
    if (document) {
      addListeners(document, 'touchstart click', this.outsideHandleClick)
    }
  }

  componentWillUnmount() {
    if (document) {
      rmListeners(document, 'touchstart click', this.outsideHandleClick)
    }
  }

  outsideHandleClick = ({ target }: SyntheticInputEvent<*>) => {
    const node = findDOMNode(this)

    if (node instanceof HTMLElement) {
      if (!node.contains(target)) {
        return this.props.onChange()
      }
    }
  }

  render() {
    return <Fragment>{this.props.children}</Fragment>
  }
}
