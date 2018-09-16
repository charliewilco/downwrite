import * as Boom from 'boom';
import * as uuid from 'uuid/v4';
import User from '../models/User';
import { hashPassword as hash } from '../util/hash';
import { createToken } from '../util/token';

export const createUser = (req, reply) => {
  const user = new User();

  user.email = req.payload.email;
  user.username = req.payload.username;
  user.admin = false;
  user.id = uuid();

  hash(req.payload.password, (err, hash) => {
    if (err) {
      throw Boom.badRequest(err);
    }

    user.password = hash;

    user.save((err, newUser) => {
      if (err) {
        throw Boom.badRequest(err);
      }

      reply({
        userID: newUser.id,
        id_token: createToken(newUser),
        username: user.username
      }).code(201);
    });
  });
};

export const authenticateUser = (req, reply) => {
  return reply({ token: createToken(req.pre.user) }).code(201);
};
