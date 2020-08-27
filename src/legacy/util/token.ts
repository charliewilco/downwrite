import * as jwt from "jsonwebtoken";
import Config from "./config";

// const fs = require('fs')
// let key = fs.readFileSync('private.key')

interface ITokenUser {
  username: string;
  _id: string;
  admin?: boolean;
}

export function createToken(user: ITokenUser): string {
  let scopes: string;

  if (user.admin) {
    scopes = "admin";
  }

  const jwtConfig: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: "180 days"
  };

  const data = {
    user: user._id,
    name: user.username,
    scope: scopes
  };

  return jwt.sign(data, Config.key, jwtConfig);
}
