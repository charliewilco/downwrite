import * as jwt from "jsonwebtoken";
import is from "@sindresorhus/is";
import * as bcrypt from "bcrypt";
import { IAppState, initialState } from "@reducers/app";
import { IUserModel } from "./models";

export type TokenContents = {
  user: string;
  name: string;
};

export async function getSaltedHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

export const SECRET_KEY =
  process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

export function createToken(user: IUserModel): string {
  const jwtConfig: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: "180 days"
  };

  const data = {
    user: user._id!,
    name: user.username,
    scope: user.admin && "admin"
  };

  return jwt.sign(data, SECRET_KEY, jwtConfig);
}

export async function isValidPassword(password: string, hashPassword: string) {
  return bcrypt.compare(password, hashPassword);
}

export interface IReadResults extends TokenContents {
  token: string;
}

export function readToken(token: string): IReadResults | null {
  const contents: TokenContents = jwt.verify(token, SECRET_KEY, {
    complete: false
  }) as TokenContents;
  return is.object(contents) ? { ...contents, token } : null;
}

export function getInitialState(t?: TokenContents): IAppState {
  if (t) {
    return Object.assign(initialState, {
      me: {
        id: t.user,
        username: t.name
      }
    });
  }

  return initialState;
}
