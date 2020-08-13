import { createUserHandler } from "../../../legacy/users";
import { withDB } from "../../../legacy/with-db";

export default withDB((req, res) => {
  switch (req.method) {
    case "POST": {
      return createUserHandler(req, res);
    }
    default:
      break;
  }
});
