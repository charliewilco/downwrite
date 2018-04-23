// @flow
import React from 'react'
import { Redirect, type Location } from 'react-router-dom'
import { withAuth } from './AuthContext'

type SnoType = {
  location: Location,
  signOut: Function
}

export default withAuth(({ location, signOut }: SnoType) => {
  signOut()

  return <Redirect to={{ pathname: '/', state: { from: location } }} />
})
