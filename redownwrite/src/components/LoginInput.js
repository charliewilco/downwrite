// @flow
import * as React from 'react'
import uuid from 'uuid/v4'
import { css } from 'glamor'

const styles = {
  container: css({
    display: 'block',
    ':not(:last-of-type)': {
      marginBottom: 16
    }
  }),
  label: css({
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#B4B4B4',
    transition: 'color 250ms ease-in-out'
  }),
  labelActive: css({
    color: 'var(--color-6)'
  }),
  input: css({
    fontFamily: 'var(--primary-font)',
    fontSize: 16,
    appearance: 'none',
    display: 'block',
    border: 0,
    width: '100%',
    borderRadius: 0,
    borderBottom: `2px solid #B4B4B4`,
    transition: 'border-bottom 250ms ease-in-out',
    ':focus': {
      outline: 'none',
      borderBottom: `2px solid var(--color-6)`
    },
    '&::placeholder': {
      color: '#D9D9D9',
      fontStyle: 'italic'
    }
  })
}

type InputType = {
  label: string,
  onChange: Function,
  value: string,
  type: string
}

export default class extends React.Component<InputType, { active: boolean }> {
  state = {
    active: false
  }

  static displayName = 'LoginInput'

  render() {
    const id = uuid()
    const { active } = this.state
    const { label } = this.props
    return (
      <label htmlFor={id} className={css(styles.container)}>
        <input
          onFocus={() => this.setState({ active: true })}
          onBlur={() => this.setState({ active: false })}
          className={css(styles.input)}
          id={id}
          {...this.props}
        />
        <small className={css(active ? [styles.label, styles.labelActive] : styles.label)}>
          {label}
        </small>
      </label>
    )
  }
}
