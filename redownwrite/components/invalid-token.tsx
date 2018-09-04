import * as React from 'react'
import Link from 'next/link'

export default class extends React.Component<{ error: string }, any> {
  render() {
    return (
      <div>
        <p>{this.props.error}</p>
        <Link href="/login">
          <a>Let's sign in again.</a>
        </Link>
      </div>
    )
  }
}
