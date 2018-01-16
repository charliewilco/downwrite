const { send, json, sendError } = require('micro')
const { draftToMarkdown } = require('markdown-draft-js')
const mc = require('micro-cors')
const { Readable } = require('stream')

const createFile = (title, content) =>
  `---
title: ${title}
---
${draftToMarkdown(content)}`

const noSpace = s => s.replace(/\s+/g, '-').toLowerCase()

const streamify = text => {
  var s = new Readable()
  s.push(text)
  s.push(null) // TODO: what was this for again?
  return s
}

const cors = mc({ allowMethods: ['POST'] })

module.exports = cors(async (req, res) => {
  try {
    const js = await json(req)
    const content = createFile(js.title, js.content)

    res.setHeader('Content-Type', 'application/force-download')
    res.setHeader('Content-Disposition', `attachment; filename="${noSpace(js.title)}.md"`)

    send(res, 200, streamify(content))
  } catch (error) {
    sendError(req, res, error)
  }
})
