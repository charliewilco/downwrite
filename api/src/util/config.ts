const address =
  process.env.NODE_ENV === 'production'
    ? `${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_ADDRESS}`
    : `127.0.0.1:27017/downwrite`;

module.exports = {
  key: process.env.SECRET_KEY || '1a9876c4-6642-4b83-838a-9e84ee00646a',
  dbCreds: `mongodb://${address}`
};
