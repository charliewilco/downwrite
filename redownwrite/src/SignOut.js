import React from 'react'
import { Redirect } from 'react-router-dom'

export default class SignOut extends React.Component {
  // TODO: Not sure if I can fire these functions in a constructor
  componentWillMount() {
    this.props.signOut()
    this.props.toggleNav()
  }

  render() {
    return <Redirect to={{ pathname: '/', state: { from: this.props.location } }} />
  }
}
