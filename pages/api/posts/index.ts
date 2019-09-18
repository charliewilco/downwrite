import * as http from "http";
import * as Hapi from "@hapi/hapi";
import micro, { send, json } from "micro";
import createServer from "../../../server";
import { prepareDB } from "../../../server/util/db";

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";

export default micro(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  // NOTE: Must start server & and connect to DB
  let db = await prepareDB();

  console.log(req.method);
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
  console.log(req.method, response.result);

  // NOTE: Must stop server & close DB
  db.disconnect();

  send(res, response.statusCode, response.result);
});
