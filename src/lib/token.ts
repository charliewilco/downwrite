import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { SECRET_KEY } from "../utils";

type ITokenUser = {
  username: string;
  _id: string;
  admin?: boolean;
};

export type TokenContents = {
  user: string;
  name: string;
};

type HashingCallback = (err: Error, hash: string) => void;

export function hashPassword(password: string, cb: HashingCallback) {
  // Generate a salt at level 10 strength
  bcrypt.genSalt(10, (_, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      return cb(err, hash);
    });
  });
}

export async function getSaltedHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

export function createToken(user: ITokenUser): string {
  const jwtConfig: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: "180 days"
  };

  const data = {
    user: user._id,
    name: user.username,
    scope: user.admin && "admin"
  };

  return jwt.sign(data, SECRET_KEY, jwtConfig);
}

export async function isValidPassword(password: string, hashPassword: string) {
  return bcrypt.compare(password, hashPassword);
}

export function readToken(token: string): TokenContents | null {
  return jwt.verify(token, SECRET_KEY, { complete: false }) as TokenContents | null;
}

export function getInitialState(t?: TokenContents): Partial<{}> {}
