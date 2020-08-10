import Mongoose from "mongoose";
import Config from "./config";

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
