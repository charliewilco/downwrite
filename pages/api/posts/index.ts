import { withJWT, NextJWTHandler } from "@legacy/with-jwt";
import Config from "@legacy/util/config";
import { getPostsHandler, createPostHandler } from "@legacy/posts";
import { dbConnect } from "@legacy/util/db";
import { methodNotAllowedJWT } from "@legacy/common";

const handler: NextJWTHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await dbConnect();
      await getPostsHandler(req, res);
      break;
    case "POST":
      await dbConnect();
      await createPostHandler(req, res);
      break;
    default:
      await methodNotAllowedJWT(req, res);
  }
};

export default withJWT(Config.key)(handler);
