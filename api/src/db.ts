import * as Mongoose from 'mongoose';
import Config from './util/config';

(<any>Mongoose).Promise = global.Promise;

Mongoose.connect(
  Config.dbCreds,
  { useNewUrlParser: true }
);

const db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`Connection with database succeeded.`);
});

exports.db = db;
