import React from 'react'

export default class extends React.Component {
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
