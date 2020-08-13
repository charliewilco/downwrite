import { withDB } from "../../../legacy/with-db";
import { authenticationHandler } from "../../../legacy/users";

export default withDB(authenticationHandler);
