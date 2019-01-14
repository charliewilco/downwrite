import * as Hapi from "hapi";
import routes from "./routes";
import Config from "./util/config";
import options from "./util/logging";
const __IS_DEV__: boolean = process.env.NODE_ENV !== "production";

const validate = async () => ({ isValid: true });

const createServer = async (port?: number): Promise<Hapi.Server> => {
  const server = new Hapi.Server({
    port: process.env.PORT || port || 4000,
    host: process.env.HOST || "localhost",
    routes: { cors: true }
  });

  if (__IS_DEV__) {
    await server.register({
      plugin: require("good"),
      options
    });
  }

  await server.register(require("hapi-auth-jwt2"));

  server.auth.strategy("jwt", "jwt", {
    key: Config.key,
    validate: validate,
    verifyOptions: {
      algorithms: ["HS256"]
    }
  });

  server.route(routes);

  return server;
};

export default createServer;
