import * as jwt from "jsonwebtoken";
import is from "@sindresorhus/is";
import * as bcrypt from "bcryptjs";
import { IUserModel } from "@server/models";
import { TokenContents } from "@shared/types";

export const SECRET_KEY =
  process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

export async function getSaltedHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

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

export interface IReadResults extends TokenContents {
  token: string;
}

export function readToken(token: string): IReadResults | null {
  const contents: TokenContents = jwt.verify(token, SECRET_KEY, {
    complete: false
  }) as TokenContents;
  return is.object(contents) ? { ...contents, token } : null;
}

export async function isValidPassword(password: string, hashPassword: string) {
  return bcrypt.compare(password, hashPassword);
}
