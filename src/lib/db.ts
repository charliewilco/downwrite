import mongoose from "mongoose";
import { __IS_PROD__ } from "../utils";

function getAddress() {
  if (__IS_PROD__) {
    return `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_ADDRESS}`;
  }
  return `mongodb://${process.env.DB_ADDRESS!}`;
}

const connection: {
  isConnected?: number;
} = {}; /* creating connection object*/

async function dbConnect() {
  if (connection.isConnected) {
    console.log("DB Connection", connection);
    return;
  }

  const address = getAddress();

  /* connecting to our database */
  const db = await mongoose.connect(address, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
  db.connection.on("error", () => {
    console.error("connection error");
  });
  db.connection.once("open", () => {
    console.log(`Connection with database succeeded.`);
    console.log("--- DOWNWRITE API ---");
  });

  connection.isConnected = db.connections[0].readyState;
}

export default dbConnect;
