import React from 'react'
import { Redirect } from 'react-router-dom'
import compose from './utils/compose'

export default ({ location, signOut, toggleNav }) => {
  let seq = compose(toggleNav, signOut)

  seq()

  return <Redirect to={{ pathname: '/', state: { from: location } }} />
}
