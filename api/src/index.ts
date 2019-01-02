import * as http from "http";
import * as Hapi from "hapi";
import * as Mongoose from "mongoose";
import Config from "./util/config";
import createServer from "./server";
import { send, json } from "micro";

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";

export default async (req: http.IncomingMessage, res: http.ServerResponse) => {
  (<any>Mongoose).Promise = global.Promise;
  const m = await Mongoose.connect(
    Config.dbCreds,
    { useNewUrlParser: true }
  );

  const db = m.connection;

  db.on("error", () => {
    console.error("connection error");
  });
  db.once("open", () => {
    console.log(`Connection with database succeeded.`);
    console.log("--- DOWNWRITE API ---");
  });

  const server: Hapi.Server = await createServer();

  const injection: Hapi.ServerInjectOptions = {
    method: req.method,
    url: req.url,
    headers: req.headers
  };

  if (__IS_DEV__) {
    console.log("SERVER", server);
    console.log("INJECTION", injection);
  }

  if (["POST", "PUT"].includes(req.method)) {
    try {
      const body = await json(req);
      injection.payload = body;
    } catch (err) {
      console.log(err);
    }
  }

  const response = await server.inject(injection);
  if (__IS_DEV__) {
    console.log(response);
  }

  send(res, response.statusCode, response.result);
};
