import * as Hapi from "@hapi/hapi";
import { json } from "micro";
import createServer from "../../server";
import { prepareDB } from "../../server/util/db";
import { NextApiRequest, NextApiResponse } from "next";

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Must start server & and connect to DB
  let db = await prepareDB();
  const server: Hapi.Server = await createServer();

  const injection: Hapi.ServerInjectOptions = {
    method: req.method,
    url: req.url,
    headers: req.headers
  };

  if (["POST", "PUT"].includes(req.method)) {
    try {
      const body = await json(req);
      injection.payload = body;
    } catch (err) {
      console.error(err);
    }
  }

  const response = await server.inject(injection);

  // NOTE: Must stop server & close DB
  db.disconnect();

  console.log(req.method, response);

  res.status(response.statusCode).json(response.result);
};
