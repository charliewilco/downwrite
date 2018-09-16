/* eslint-disable no-console */
// TODO: remove username from boilerplate, or use it, IDK
import * as Hapi from 'hapi';
import * as Mongoose from 'mongoose';
import routes from './routes';
import Config from './util/config';

(<any>Mongoose).Promise = global.Promise;
Mongoose.connect(
  Config.dbCreds,
  { useMongoClient: true }
);

const db = Mongoose.connection;

const server = new Hapi.Server();

server.connection({
  port: 4411,
  host: 'localhost',
  routes: { cors: true }
});

server.register({
  register: require('good'),
  options: {
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ response: '*', log: '*' }]
        },
        {
          module: 'good-console'
        },
        'stdout'
      ]
    }
  }
});

server.register(require('hapi-auth-jwt'), () => {
  server.auth.strategy('jwt', 'jwt', {
    key: Config.key,
    verifyOptions: {
      algorithms: ['HS256']
    }
  });

  server.route(routes);
});

server.start(err => {
  if (err) {
    throw new Error(err) && process.exit(1);
  }

  server.log('info', 'Server running at: ' + server.info.uri);

  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {
    console.log(`Connection with database succeeded.`);
  });
});

export default server;
