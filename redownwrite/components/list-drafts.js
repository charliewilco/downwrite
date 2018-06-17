// @flow

import React from 'react'

type LocalDraftTypes = {
  drafts: Array<*>
}

export default class extends React.Component<void, LocalDraftTypes> {
  state = {
    drafts: []
  }

  searchLocalStorage = () => {
    return localStorage.forEach(
      (item, iterator) => localStorage.key(iterator).contains('Draft') && item
    )
  }

  componentDidMount() {
    let storage = this.searchLocalStorage()

    return storage.forEach(item => item)
  }

  render() {
    return <span>I should be a list and i'm not</span>
  }
}
