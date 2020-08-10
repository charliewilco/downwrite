import { withJWT } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getPost, updatePost, removePost } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

export default withJWT(Config.key)(async (req, res) => {
  const { user } = req.jwt;
  await dbConnect();

  const id = Array.isArray(req.query.id) ? req.query.id.join("") : req.query.id;

  switch (req.method) {
    case "GET": {
      let post = await getPost(user, id);
      return res.send({ post });
    }
    case "PUT": {
      let post = await updatePost(user, id, req.body);
      return res.send({ post });
    }

    case "DELETE": {
      let message = await removePost(user, id);
      return res.send(message);
    }
    default:
      break;
  }
});
