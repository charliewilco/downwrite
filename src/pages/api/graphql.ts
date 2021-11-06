import { NextApiHandler } from "next";
import { server } from "@lib/server";

export const config = {
  api: {
    bodyParser: false
  }
};

const start = server.start();
const handler: NextApiHandler = async (req, res) => {
  await start;
  await server.createHandler({
    path: "/api/graphql"
  })(req, res);
};

export default handler;
