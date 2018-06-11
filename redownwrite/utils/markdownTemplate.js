import format from 'date-fns/format'

export const createMarkdown = (title, content, date) => `
---
title: ${title}
dateAdded: ${format(date.toString(), 'DD MMMM YYYY')}
---

${content}
`
