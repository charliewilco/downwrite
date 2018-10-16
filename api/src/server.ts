import * as Hapi from "hapi";
import * as Mongoose from "mongoose";
import routes from "./routes";
import Config from "./util/config";

(<any>Mongoose).Promise = global.Promise;
Mongoose.connect(
  Config.dbCreds,
  { useNewUrlParser: true }
);

console.log(process.env.PORT, process.env.MONGO_URL);

const dev: boolean = process.env.NODE_ENV !== "production";

const db = Mongoose.connection;

const validate = async () => ({ isValid: true });

const init = async (): Promise<Hapi.Server> => {
  const server = new Hapi.Server({
    port: process.env.PORT || 4411,
    host: "localhost",
    routes: { cors: true }
  });

  await server.register({
    plugin: require("good"),
    options: {
      reporters: {
        console: [
          {
            module: "good-squeeze",
            name: "Squeeze",
            args: [{ response: "*", log: "*" }]
          },
          {
            module: "good-console"
          },
          "stdout"
        ]
      }
    }
  });

  if (dev) {
    await server.register([require("vision"), require("inert"), require("lout")]);
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

  await server.start();

  return server;
};

init()
  .then(server => {
    console.log("info", "Server running at: " + server.info.uri);

    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", () => {
      console.log(`Connection with database succeeded.`);
    });
  })
  .catch(err => {
    console.log(err);
    throw new Error(err) && process.exit(1);
  });
