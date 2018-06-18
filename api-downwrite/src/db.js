/* eslint-disable no-console */

const Mongoose = require('mongoose')
const { dbCreds } = require('./util/config')

Mongoose.Promise = global.Promise
Mongoose.connect(dbCreds, { useMongoClient: true })

const db = Mongoose.connection

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  console.log(
    `Connection with database succeeded.`,
    `${db.host}:${db.port}/${db.name}`
  )
})

exports.db = db
