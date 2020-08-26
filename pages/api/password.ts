import { updatePasswordHandler } from "../../legacy/users";
import { methodNotAllowedJWT } from "../../legacy/common";
import { withJWT, NextJWTHandler } from "../../legacy/with-jwt";
import Config from "../../legacy/util/config";
import { dbConnect } from "../../legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  await dbConnect();
  switch (req.method) {
    case "POST":
      await updatePasswordHandler(req, res);
    default:
      await methodNotAllowedJWT(req, res);
  }
};

export default withJWT(Config.key)(handler);
