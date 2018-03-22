// @flow
import React from 'react'
import { Redirect, type Location } from 'react-router-dom'
import compose from './utils/compose'

type SnoType = {
  location: Location,
  signOut: Function,
  toggleNav: Function
}

export default ({ location, signOut, toggleNav }: SnoType) => {
  let seq = compose(toggleNav, signOut)

  seq()

  return <Redirect to={{ pathname: '/', state: { from: location } }} />
}
