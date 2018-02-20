// @flow

import { Container } from 'unstated'

type ErrorTypes = {
  content: string,
  type: string
}

export default class ErrorState extends Container<ErrorTypes> {
  state = {
    content: '',
    type: ''
  }

  clearFlash = () => this.setState({ content: '', type: '' })

  setFlash = (content: string, type: string) => this.setState({ content, type })
}
