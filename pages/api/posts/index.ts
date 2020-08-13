import { withJWT, NextJWTHandler } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getPostsHandler, createPostHandler } from "../../../legacy/posts";
import { withDB } from "../../../legacy/with-db";

const handler: NextJWTHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      return getPostsHandler(req, res);
    case "POST":
      return createPostHandler(req, res);
    default:
      break;
  }
};

export default withDB(withJWT(Config.key)(handler));
