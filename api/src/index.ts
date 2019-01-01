import * as http from "http";
import * as Hapi from "hapi";
import * as Mongoose from "mongoose";
import Config from "./util/config";
import createServer from "./server";
import { send, json } from "micro";

export default async (req: http.IncomingMessage, res: http.ServerResponse) => {
  (<any>Mongoose).Promise = global.Promise;
  Mongoose.connect(
    Config.dbCreds,
    { useNewUrlParser: true }
  );

  const db = Mongoose.connection;

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

  if (["POST", "PUT"].includes(req.method)) {
    try {
      const body = await json(req);
      injection.payload = body;
    } catch (err) {
      console.log(err);
    }
  }

  const response = await server.inject(injection);

  send(res, response.statusCode, response.result);
};
