// @flow

import format from 'date-fns/format'

export const createMarkdown = (
  title: string,
  content: string,
  date: Date
): string => `
---
title: ${title}
dateAdded: ${format(date.toString(), 'DD MMMM YYYY')}
---

${content}
`
