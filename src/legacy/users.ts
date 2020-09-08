import { NextApiHandler } from "next";
import Boom from "@hapi/boom";
import { v4 as uuid } from "uuid";
import * as bcrypt from "bcrypt";
import base64 from "base-64";
import { UserModel, IUser } from "./models";
import { validPasswordUpdate, validUser } from "./validations";
import { createToken } from "./util/token";
import { NextJWTHandler } from "./with-jwt";

function decodeBody(body: any) {
  const n = Object.assign({}, body);

  for (let key in body) {
    n[key] = base64.decode(body[key]);
  }
  return n;
}

export const updatePasswordHandler: NextJWTHandler = async (req, res) => {
  try {
    const { user } = req.jwt;
    const body = decodeBody(req.body);
    await validPasswordUpdate.validateAsync(body);
    await verifyValidPassword(user, body.oldPassword);
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(body.newPassword, salt);
    const updated = await UserModel.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { password: newPasswordHash } },
      { new: true, select: "username email" }
    );

    res.status(201).json(updated);
  } catch (err) {
    const e = Boom.isBoom(err) ? err : Boom.internal("Internal MongoDB error", err);
    res.status(e.output.statusCode).json(e.output.payload);
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

export const getUserSettingsHandler: NextJWTHandler = async (req, res) => {
  try {
    const { user } = req.jwt;
    const details = await getUserDetails(user);

    res.status(201).json(details);
  } catch (err) {
    const e = Boom.badRequest(err);
    res.status(e.output.statusCode).json(e.output.payload);
  }
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
      throw new Error("Incorrect password!");
    }
  } else {
    throw new Error("Incorrect username or email!");
  }
};

export const authenticationHandler: NextApiHandler = async (req, res) => {
  try {
    const { user, password } = req.body;
    const foundUser = await verifyCredentials(password, user);
    const token = createToken(foundUser);

    res.status(201).send({ token });
  } catch (error) {
    const e = Boom.badRequest(error);
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

export const updateSettings: NextJWTHandler = async (req, res) => {
  const { user } = req.jwt;
  const { username, email } = req.body;

  try {
    const updated = await UserModel.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { username, email } },
      { new: true, select: "username email" }
    );

    res.status(201).json(updated);
  } catch (err) {
    const e = Boom.internal("Internal MongoDB error", err);
    res.status(e.output.statusCode).json(e.output.payload);
  }
};
