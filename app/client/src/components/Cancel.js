import React, { Component } from 'react'
import { css } from 'glamor'

const cancelDelete = css({
  marginRight: 16,
  color: `var(--color-2)`,
  background: 'none',
  border: 0,
  fontWeight: '700'
})

export default class CancelButton extends Component {
  static displayName = 'Cancel'

  render() {
    return <button className={cancelDelete} {...this.props} />
  }
}
