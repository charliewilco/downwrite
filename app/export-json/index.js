const { send, json, sendError } = require('micro')
const { draftToMarkdown } = require('markdown-draft-js')
const mc = require('micro-cors')
const { Readable } = require('stream')

const createFile = ({ title, dateModified, content }) => ({
  title: title,
  dateModified: dateModified,
  content: draftToMarkdown(content)
})

const noSpace = s => s.replace(/\s+/g, '-').toLowerCase()

const streamify = text => {
  var s = new Readable()
  s.push(text)
  s.push(null)
  return s
}

const cors = mc({ allowMethods: ['POST'] })

module.exports = cors(async (req, res) => {
  try {
    const js = await json(req)
    const content = createFile(js)

    res.setHeader('Content-Type', 'application/force-download')
    res.setHeader('Content-Disposition', `attachment; filename="${noSpace(js.title)}.json"`)

    send(res, 200, content)
  } catch (error) {
    sendError(req, res, error)
  }
})
