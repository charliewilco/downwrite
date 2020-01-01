import { server } from "../../utils/graphql";

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = server.createHandler({ path: "/api/graphql" });

export default handler;
