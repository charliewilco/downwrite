import { withJWT, NextJWTHandler } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import {
  getPostHandler,
  updatePostHandler,
  removePostHandler
} from "../../../legacy/posts";
import { withDB } from "../../../legacy/with-db";

const handler: NextJWTHandler = async (req, res) => {
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

export default withDB(withJWT(Config.key)(handler));
