// @flow

import { Container } from 'unstated'

type OfflineAtrx = {
  offline: boolean
}

export default class OfflineContainer extends Container<OfflineAtrx> {
  state = {
    offline: !window.navigator.onLine
  }

  handleChange = (offline: boolean) => this.setState({ offline })
}
