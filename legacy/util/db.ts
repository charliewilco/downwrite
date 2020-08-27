import Mongoose from "mongoose";
import Config from "./config";

const options: Mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

const connection: { isConnected?: number } = {}; /* creating connection object*/

export async function dbConnect() {
  /* check if we have connection to our databse*/
  if (connection.isConnected) {
    return;
  }

  /* connecting to our database */
  try {
    const db = await Mongoose.connect(Config.dbCreds, options);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    throw new Error(error);
  }
}
