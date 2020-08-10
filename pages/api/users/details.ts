import { withJWT } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getUserDetails } from "../../../legacy/users";
import { dbConnect } from "../../../legacy/util/db";

export default withJWT(Config.key)(async (req, res) => {
  await dbConnect();
  const { user } = req.jwt;

  const details = await getUserDetails(user);

  res.send(details);
});
