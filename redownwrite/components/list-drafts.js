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
    console.log(localStorage)
    return localStorage.length
    // return localStorage.forEach((item, iterator) => localStorage.key(iterator).contains('Draft') && item)
  }

  componentDidMount() {
    let storage = this.searchLocalStorage()
    console.log(storage)
  }
  render() {
    return <span>I should be a list and i'm not</span>
  }
}
