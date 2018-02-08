import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class extends Component {
  render() {
    return (
      <div>
        <p>{this.props.error}</p>
        <Link to="/signout">Let's sign in again.</Link>
      </div>
    )
  }
}
