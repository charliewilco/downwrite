const address =
  process.env.NODE_ENV === 'production'
    ? `${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_ADDRESS}`
    : `127.0.0.1:27017/downwrite`

module.exports = {
  key: process.env.SECRET_KEY,
  dbCreds: `mongodb://${address}`
}
