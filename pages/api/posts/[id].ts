import { withJWT, NextJWTHandler } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import {
  getPostHandler,
  updatePostHandler,
  removePostHandler
} from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  await dbConnect();
  switch (req.method) {
    case "GET": {
      return getPostHandler(req, res);
    }
    case "PUT": {
      return updatePostHandler(req, res);
    }
    case "DELETE": {
      return removePostHandler(req, res);
    }
    default:
      break;
  }
};

export default withJWT(Config.key)(handler);
