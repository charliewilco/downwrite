// tslint:disable: no-console
import Mongoose from "mongoose";
import Config from "./config";

export const prepareDB = async (): Promise<typeof Mongoose> => {
  (<any>Mongoose).Promise = global.Promise;
  const m = await Mongoose.connect(Config.dbCreds, { useNewUrlParser: true });

  Mongoose.set("useFindAndModify", true);

  const db = m.connection;

  db.on("error", () => {
    console.error("connection error");
  });
  db.once("open", () => {
    console.log(`Connection with database succeeded.`);
    console.log("--- DOWNWRITE API ---");
  });

  return m;
};

const connection: { isConnected?: number } = {}; /* creating connection object*/

export async function dbConnect() {
  /* check if we have connection to our databse*/
  if (connection.isConnected) {
    return;
  }

  /* connecting to our database */
  const db = await Mongoose.connect(Config.dbCreds, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });

  connection.isConnected = db.connections[0].readyState;
}
