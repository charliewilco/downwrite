import React from 'react'

const Link = ({ children, to, className }) => {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  )
}

module.exports = Link
