import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";

export type NextJWTHandler<T = any> = (
  req: { jwt: T | string | object } & NextApiRequest,
  res: NextApiResponse
) => void | Promise<void>;

export const withJWT = <T extends unknown>(secret: string) => (
  fn: NextJWTHandler
) => {
  if (!secret) {
    throw Error(
      "JWT must be initialized passing a secret to decode incoming JWT token"
    );
  }

  return (req: NextApiRequest, res: NextApiResponse) => {
    const { DW_TOKEN } = req.cookies;
    const bearerToken = DW_TOKEN;
    if (!bearerToken) {
      res.writeHead(401);
      res.end("Missing Authorization header");
      return;
    }

    try {
      const token = bearerToken.replace("Bearer ", "");
      const j: unknown = jwt.verify(token, secret);
      const r = Object.assign(req, { jwt: j });

      return fn(r, res);
    } catch (err) {
      res.status(401).send(err);
    }
  };
};
