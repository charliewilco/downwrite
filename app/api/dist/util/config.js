'use strict';

const address = process.env.NODE_ENV === 'production' ? `${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_ADDRESS}` : `127.0.0.1:27017/downwrite`;

module.exports = {
	key: 'b2d45bbb-4277-4397-b8d2-a6c67a8003f5',
	dbCreds: `mongodb://${address}`
};