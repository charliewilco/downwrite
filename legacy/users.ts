import Boom from "@hapi/boom";
import uuid from "uuid/v4";
import * as bcrypt from "bcrypt";
import { UserModel, IUser } from "./models";
import { createToken } from "./util/token";

export const createUser = async (body: any) => {
  const { email, username, password } = body;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const id = uuid();

  try {
    let user: IUser = await UserModel.create<any>(
      Object.assign({}, { email, username, id, password: hash, admin: false })
    );
    let token = createToken(user);

    return {
      userID: user.id,
      id_token: token,
      username: user.username
    } as const;
  } catch (error) {
    throw Boom.badImplementation(error);
  }
};

export const verifyUniqueUser = async (body: any) => {
  const { username, email } = body;
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

  return body;
};

export const getUserDetails = async (user: string) => {
  const foundUser = await UserModel.findById(user, ["username", "email"]).lean();

  return foundUser;
};
