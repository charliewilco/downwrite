import Boom from "@hapi/boom";
import { NextApiHandler } from "next";
import { NextJWTHandler } from "./with-jwt";

export const methodNotAllowed: NextApiHandler = async (_, res) => {
  const e = Boom.methodNotAllowed();
  res.status(e.output.statusCode).json(e.output.payload);
};

export const methodNotAllowedJWT: NextJWTHandler = async (_, res) => {
  const e = Boom.methodNotAllowed();
  res.status(e.output.statusCode).json(e.output.payload);
};
