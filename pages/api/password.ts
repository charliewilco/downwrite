import Boom from "@hapi/boom";
import { updatePasswordHandler } from "../../legacy/users";
import { withJWT, NextJWTHandler } from "../../legacy/with-jwt";
import Config from "../../legacy/util/config";
import { dbConnect } from "../../legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  await dbConnect();
  switch (req.method) {
    case "POST":
      await updatePasswordHandler(req, res);
    default:
      const e = Boom.methodNotAllowed();
      res.status(e.output.statusCode).json(e.output.payload);
  }
};

export default withJWT(Config.key)(handler);
