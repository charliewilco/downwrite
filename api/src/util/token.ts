import * as jwt from "jsonwebtoken";
import Config from "./config";

// const fs = require('fs')
// let key = fs.readFileSync('private.key')
export function createToken(user): string {
  let scopes: string;

  if (user.admin) {
    scopes = "admin";
  }

  const jwtConfig = {
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
