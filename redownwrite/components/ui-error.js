// @flow
import React, { Component, createContext } from 'react'
import UIFlash from './ui-flash-messages'
import Null from './null'

type ErrorTypes = {
  content: string,
  type: string
}

const ErrorStateContext = createContext()

ErrorStateContext.Provider.displayName = 'ErrorStateContext.Provider'
ErrorStateContext.Consumer.displayName = 'ErrorStateContext.Consumer'

const UIErrorMessage = ({
  errorState: { content, type },
  errorActions: { clearFlashMessage }
}) =>
  content.length > 0 ? (
    <UIFlash content={content} type={type} onClose={clearFlashMessage} />
  ) : (
    <Null />
  )

export const withErrors = (Cx: React.ElementType) => {
  return class extends Component<any, any> {
    static displayName = `withErrors(${Cx.displayName || Cx.name})`

    render() {
      return (
        <ErrorStateContext.Consumer>
          {errs => <Cx {...this.props} {...errs} />}
        </ErrorStateContext.Consumer>
      )
    }
  }
}

export class ErrorContainer extends Component<void, ErrorTypes> {
  state = {
    content: '',
    type: ''
  }

  setError = (content: string, type: string) => this.setState({ content, type })
  clearFlash = () => this.setState({ content: '', type: '' })

  render() {
    const { children } = this.props

    const value = {
      errorState: {
        ...this.state
      },
      errorActions: {
        setError: this.setError,
        clearFlashMessage: this.clearFlash
      }
    }

    return (
      <ErrorStateContext.Provider value={value}>
        {children}
      </ErrorStateContext.Provider>
    )
  }
}

export const UIErrorBanner = withErrors(UIErrorMessage)
