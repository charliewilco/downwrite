import { withJWT, NextJWTHandler } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getPostsHandler, createPostHandler } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  await dbConnect();
  switch (req.method) {
    case "GET":
      await getPostsHandler(req, res);
      break;
    case "POST":
      await createPostHandler(req, res);
      break;
    default:
      break;
  }
};

export default withJWT(Config.key)(handler);
