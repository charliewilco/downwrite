import * as Hapi from "hapi";
import * as Boom from "boom";
import * as uuid from "uuid/v4";
import * as bcrypt from "bcrypt";
import { UserModel as User, IUser } from "../models/User";
import { createToken } from "../util/token";

import { IRequest, IRegisterRequest, ILoginRequest } from "./types";

export const createUser = async (
  request: IRegisterRequest,
  h: Hapi.ResponseToolkit
) => {
  const { email, username, password } = request.payload;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const id = uuid();

  try {
    let user: IUser = await User.create(
      Object.assign({}, { email, username, id, password: hash, admin: false })
    );
    let token = createToken(user);

    return h
      .response({
        userID: user.id,
        id_token: token,
        username: user.username
      })
      .code(201);
  } catch (error) {
    return Boom.badImplementation(error);
  }
};

export const authenticateUser = (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  return h.response({ token: createToken(request.pre.user) }).code(201);
};

export const getDetails = async (
  request: IRequest,
  h: Hapi.ResponseToolkit
): Promise<IUser> => {
  const { user } = request.auth.credentials;

  const foundUser = await User.findById(user, ["username", "email"]).lean();

  return foundUser;
};

interface IUpdatePassword extends IRequest {
  payload: {
    oldPassword: string;
    newPassword: string;
  };
}

export const updatePassword = async (request: IUpdatePassword) => {
  const { user } = request.auth.credentials;
  const { oldPassword, newPassword } = request.payload;
  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  try {
    const updated = await User.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { password: newPasswordHash } },
      { new: true, select: "username email" }
    );

    return updated;
  } catch (err) {
    return Boom.internal("Internal MongoDB error", err);
  }
};

export const verifyValidPassword = async request => {
  const { user } = request.auth.credentials;
  const { oldPassword, newPassword } = request.payload;
  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // Validates the the old password was actually the user's password
  const isPasswordValid = async oldPassword => {
    const { password } = await User.findById(user, "password").lean();
    const result = await bcrypt.compare(oldPassword, password);

    return result;
  };

  const valid = await isPasswordValid(oldPassword);

  if (!valid) {
    return Boom.badRequest("That wasn't your password");
  }

  return request.payload;
};

export const verifyUniqueUser = async (request: IRegisterRequest) => {
  const { username, email } = request.payload;
  const user: IUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (user) {
    if (user.username === username) {
      return Boom.badRequest("Username taken");
    }
    if (user.email === email) {
      return Boom.badRequest("Email taken");
    }
  }

  return request.payload;
};

interface IUpdateEmailNameRequest extends IRequest {
  payload: {
    username: string;
    email: string;
  };
}

export const updateNameEmail = async (
  request: IUpdateEmailNameRequest
): Promise<IUser | Boom<any>> => {
  const { user } = request.auth.credentials;
  const { username, email } = request.payload;

  try {
    const updated = await User.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { username, email } },
      { new: true, select: "username email" }
    );

    return updated;
  } catch (err) {
    return Boom.internal("Internal MongoDB error", err);
  }
};

export const verifyCredentials = async (request: ILoginRequest) => {
  const { password, user: identifier } = request.payload;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (user) {
    const isValid = await bcrypt.compare(password, user.password);

    return isValid ? user : Boom.badRequest("Incorrect password!");
  } else {
    return Boom.badRequest("Incorrect username or email!");
  }
};
