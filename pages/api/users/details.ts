import { withJWT, NextJWTHandler } from "@legacy/with-jwt";
import Config from "@legacy/util/config";
import { getUserDetails } from "@legacy/users";
import { methodNotAllowedJWT } from "@legacy/common";
import { dbConnect } from "@legacy/util/db";

const handler: NextJWTHandler = async (req, res) => {
  switch (req.method) {
    case "GET": {
      await dbConnect();
      const { user } = req.jwt;
      const details = await getUserDetails(user);
      res.send(details);
    }
    default: {
      await methodNotAllowedJWT(req, res);
    }
  }
};

export default withJWT(Config.key)(handler);
