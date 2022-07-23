/* eslint-disable react-hooks/rules-of-hooks */
import { ResolverContext } from "@server/context";
import { schema } from "@server/schema";

import { createServer } from "@graphql-yoga/node";
import { NextApiRequest, NextApiResponse } from "next";

const server = createServer<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  context(_: ResolverContext) {
    return _;
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default server;
