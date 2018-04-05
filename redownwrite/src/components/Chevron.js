import React from 'react'

export default ({ open }: { open: boolean }) => (
  <svg
    className="Chevron"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}>
    <path
      d={
        open
          ? 'M1.0606601717798212 11 L8 4.060660171779821 L14.939339828220179 11'
          : 'M1.0606601717798212 5 L8 11.939339828220179 L14.939339828220179 5'
      }
    />
  </svg>
)
