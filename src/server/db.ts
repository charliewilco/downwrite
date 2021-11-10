import mongoose from "mongoose";
import {
  LOCAL_DB_ADDRESS,
  __IS_DEV__,
  __IS_PROD__,
  __IS_TEST__
} from "@shared/constants";

function getAddress() {
  return process.env.ATLAS_DB_ADDRESS || LOCAL_DB_ADDRESS;
}

const connection: {
  isConnected?: number;
} = {}; /* creating connection object*/

export default async function dbConnect() {
  if (connection.isConnected) {
    console.log("DB Connection", connection);
    return;
  }

  const address = getAddress();

  let options: mongoose.ConnectOptions = {
    autoCreate: true,
    autoIndex: true
  };

  /* connecting to our database */
  const db = await mongoose.connect(address, options);

  connection.isConnected = db.connections[0].readyState;
}

export const clearDB = async () => {
  if (connection.isConnected) {
    console.log("DB Connection", connection);
  }

  console.log("Clearing the database and it's dangerous");
  const db = await mongoose.connect(LOCAL_DB_ADDRESS, {
    autoCreate: true,
    autoIndex: true
  });

  await db.connection.dropDatabase();
  await db.connection.close();
};

export const stopDB = async () => {
  await mongoose.connection.close();
};
