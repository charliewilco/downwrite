import { getPreviewHandler } from "../../../legacy/posts";
import { withDB } from "../../../legacy/with-db";

export default withDB(getPreviewHandler);
