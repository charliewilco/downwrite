import { withJWT, NextJWTHandler } from "@legacy/with-jwt";
import { updateSettings, getUserSettingsHandler } from "@legacy/users";
import { methodNotAllowedJWT } from "@legacy/common";
import Config from "@legacy/util/config";
import { dbConnect } from "@legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  switch (req.method) {
    case "GET": {
      await dbConnect();
      await getUserSettingsHandler(req, res);
      break;
    }
    case "POST": {
      await dbConnect();
      await updateSettings(req, res);
      break;
    }
    default:
      await methodNotAllowedJWT(req, res);
  }
};

export default withJWT(Config.key)(handler);
