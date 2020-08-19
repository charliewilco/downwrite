import { NextApiHandler } from "next";
import Boom from "@hapi/boom";
import uuid from "uuid/v4";
import * as bcrypt from "bcrypt";
import { UserModel, IUser } from "./models";
import { validUser } from "./validations";
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

export const verifyCredentials = async (password: string, identifier: string) => {
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

export const authenticationHandler: NextApiHandler = async (req, res) => {
  try {
    const { user, password } = req.body;
    const foundUser = await verifyCredentials(password, user);

    const token = createToken(foundUser);

    res.status(201).send({ token });
  } catch (error) {
    const e = Boom.boomify(error);

    res.status(e.output.statusCode).json(e.output.payload);
  }
};

export const createUserHandler: NextApiHandler = async (req, res) => {
  try {
    let value = await validUser.validateAsync(req.body);
    let user = await verifyUniqueUser(value);
    let u = await createUser(user);
    res.send(u);
  } catch (error) {
    const e = Boom.boomify(error);
    res.status(e.output.statusCode).json(e.output.payload);
  }
};
