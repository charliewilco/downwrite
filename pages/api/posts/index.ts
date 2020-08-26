import Boom from "@hapi/boom";
import { withJWT, NextJWTHandler } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getPostsHandler, createPostHandler } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await dbConnect();
      await getPostsHandler(req, res);
    case "POST":
      await dbConnect();
      await createPostHandler(req, res);
    default:
      const e = Boom.methodNotAllowed();
      res.status(e.output.statusCode).json(e.output.payload);
  }
};

export default withJWT(Config.key)(handler);
