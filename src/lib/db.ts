import mongoose from "mongoose";

const address: string = `mongodb://${process.env.DB_ADDRESS!}`;

const connection: {
  isConnected?: number;
} = {}; /* creating connection object*/

async function dbConnect() {
  if (connection.isConnected) {
    console.log(connection);
    return;
  }

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
