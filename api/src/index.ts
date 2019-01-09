import * as http from "http";
import * as Hapi from "hapi";
import createServer from "./server";
import { send, json } from "micro";
import { prepareDB } from "./util/db";

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";

// const serverlessRoutes = [
//   { src: "/api/posts", methods: ["GET", "POST"], dest: "/src/index.ts" },
//   {
//     src: "/api/posts/preview/(.*)",
//     methods: ["GET"],
//     dest: "/src/index.ts"
//   },

//   {
//     src: "/api/posts/(.*)",
//     methods: ["GET", "PUT", "DELETE", "POST"],
//     dest: "/src/index.ts"
//   },
//   {
//     src: "/api/users/(.*)",
//     methods: ["GET", "POST"],
//     dest: "/src/index.ts"
//   },
//   {
//     src: "/api/users",
//     methods: ["GET", "POST"],
//     dest: "/src/index.ts"
//   },
//   { src: "/api/password", methods: ["POST"], dest: "/src/index.ts" }
// ];

export default async (req: http.IncomingMessage, res: http.ServerResponse) => {
  // NOTE: Must start server & and connect to DB
  let db = await prepareDB();
  const server: Hapi.Server = await createServer();

  const injection: Hapi.ServerInjectOptions = {
    method: req.method,
    url: req.url,
    headers: req.headers
  };

  console.log("INJECTION", req.method, req.url);

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
    console.log("RESULT", response.result);
  }

  // NOTE: Must stop server & close DB
  await server.stop();
  db.disconnect();

  send(res, response.statusCode, response.result);
};
