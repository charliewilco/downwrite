import * as bcrypt from 'bcrypt';
import * as Boom from 'boom';
import { UserModel as User, IUser } from '../models/User';
import { request } from 'https';

export const verifyUniqueUser = async (request, h) => {
  // Find an entry from the database that
  // matches either the email or username

  const state = await User.findOne(
    {
      $or: [{ email: request.payload.email }, { username: request.payload.username }]
    },
    (err, user: IUser) => {
      if (err) {
        return err;
      }
      // Check whether the username or email
      // is already taken and error out if so
      if (user) {
        if (user.username === request.payload.username) {
          return Boom.badRequest('Username taken');
        }
        if (user.email === request.payload.email) {
          return Boom.badRequest('Email taken');
        }
      }
      // If everything checks out, send the payload through
      // to the route handler
      return request.payload;
    }
  );

  return state;
};

export const verifyCredentials = (req, res) => {
  const password = req.payload.password;
  // Find an entry from the database that
  // matches either the email or username

  User.findOne(
    {
      $or: [{ email: req.payload.user }, { username: req.payload.user }]
    },
    (err: Error, user) => {
      if (user) {
        const state = bcrypt.compare(
          password,
          user.password,
          (err: Error, isValid) => {
            if (err) {
              return Boom.boomify(err, { statusCode: 400 });
            }
            if (isValid) {
              return;
            } else {
              return Boom.badRequest('Incorrect password!');
            }
          }
        );
      } else {
        return Boom.badRequest('Incorrect username or email!');
      }
    }
  );
};
