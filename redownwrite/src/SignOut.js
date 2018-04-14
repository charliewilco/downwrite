// @flow
import React from 'react'
import { Redirect, type Location } from 'react-router-dom'

type SnoType = {
  location: Location,
  signOut: Function
}

export default ({ location, signOut }: SnoType) => {
  signOut()

  return <Redirect to={{ pathname: '/', state: { from: location } }} />
}
