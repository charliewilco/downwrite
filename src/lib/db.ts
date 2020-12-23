import mongoose from "mongoose";
import { __IS_DEV__, __IS_PROD__, __IS_TEST__ } from "@utils/dev";

const developDBAddrress = "mongodb://127.0.0.1:27017/downwrite";

function getAddress() {
  return process.env.ATLAS_DB_ADDRESS || developDBAddrress;
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

  let options: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  };

  if (__IS_DEV__ || __IS_TEST__) {
    options = Object.assign(options, {
      autoReconnect: true,
      poolSize: 10
    });
  }

  /* connecting to our database */
  const db = await mongoose.connect(address, options);
  db.connection.on("error", () => {
    console.error("connection error");
  });
  db.connection.once("open", () => {
    console.log(`Connection with database succeeded.`);
    console.log("--- DOWNWRITE API ---");
  });

  connection.isConnected = db.connections[0].readyState;
}

export const clearDB = async () => {
  if (connection.isConnected) {
    console.log("DB Connection", connection);
  }

  console.log("Clearing the database and it's dangerous");
  const db = await mongoose.connect(developDBAddrress);

  await db.connection.dropDatabase();
  await db.connection.close();
};

export const stopDB = async () => {
  await mongoose.connection.close();
};
