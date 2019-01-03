import * as Mongoose from "mongoose";
import Config from "./config";

export const prepareDB = async (): Promise<void> => {
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
};
