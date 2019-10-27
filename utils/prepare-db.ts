import Mongoose from "mongoose";
import { Config } from "./server-config";

export const prepareDB = async (): Promise<typeof Mongoose> => {
  Mongoose.Promise = global.Promise;
  const m = await Mongoose.connect(Config.dbCreds, { useNewUrlParser: true });

  Mongoose.set("useFindAndModify", true);

  const db = m.connection;

  db.on("error", () => {
    console.error("connection error");
  });

  db.once("open", () => {
    // tslint:disable: no-console
    console.info(`Connection with database succeeded.`);
    console.info("--- DOWNWRITE API ---");
  });

  return m;
};
