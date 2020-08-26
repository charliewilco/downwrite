import Boom from "@hapi/boom";
import uuid from "uuid/v4";
import * as bcrypt from "bcrypt";
import { UserModel, IUser } from "../models";
import { createToken } from "../util/token";

import { IRequest, IRegisterRequest, ILoginRequest } from "./types";

export interface ICreateResponse {
  userID: string;
  id_token: string;
  username: string;
}

export const createUser = async (request: IRegisterRequest, h: any) => {
  const { email, username, password } = request.payload;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const id = uuid();

  try {
    let user: IUser = await UserModel.create<any>(
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
    throw Boom.badImplementation(error);
  }
};

export interface IAuthUser {
  token: string;
}

export const authenticateUser = (request: any, h: any): any => {
  return h.response({ token: createToken(request.pre.user) }).code(201);
};

export const getDetails = async (request: IRequest): Promise<any> => {
  const { user } = request.auth.credentials;

  const foundUser = await UserModel.findById(user, ["username", "email"]).lean();

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
  const { newPassword } = request.payload;
  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  try {
    const updated = await UserModel.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { password: newPasswordHash } },
      { new: true, select: "username email" }
    );

    return updated;
  } catch (err) {
    throw Boom.internal("Internal MongoDB error", err);
  }
};

export const verifyValidPassword = async (user: any, oldPassword: string) => {
  // const salt = await bcrypt.genSalt(10);
  // const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // Validates the the old password was actually the user's password
  const isPasswordValid = async (p: string): Promise<boolean> => {
    const { password } = (await UserModel.findById(user, "password").lean()) as any;
    const result = await bcrypt.compare(p, password as string);

    return result;
  };

  const valid = await isPasswordValid(oldPassword);

  if (!valid) {
    throw Boom.badRequest("That wasn't your password");
  }
};

export const verifyUniqueUser = async (request: IRegisterRequest) => {
  const { username, email } = request.payload;
  const user: IUser = await UserModel.findOne({
    $or: [{ email }, { username }]
  });

  if (user) {
    if (user.username === username) {
      throw Boom.badRequest("Username taken");
    }
    if (user.email === email) {
      throw Boom.badRequest("Email taken");
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
): Promise<IUser> => {
  const { user } = request.auth.credentials;
  const { username, email } = request.payload;

  try {
    const updated = await UserModel.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { username, email } },
      { new: true, select: "username email" }
    );

    return updated;
  } catch (err) {
    throw Boom.internal("Internal MongoDB error", err);
  }
};

export const verifyCredentials = async (request: ILoginRequest) => {
  const { password, user: identifier } = request.payload;

  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (user) {
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      return user;
    } else {
      throw Boom.badRequest("Incorrect password!");
    }
  } else {
    throw Boom.badRequest("Incorrect username or email!");
  }
};
