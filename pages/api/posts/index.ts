import { withJWT } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getPosts, createPost } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

export default withJWT(Config.key)(async (req, res) => {
  const { user } = req.jwt;

  await dbConnect();

  switch (req.method) {
    case "GET":
      const posts = await getPosts(user);
      return res.send({ posts });
    case "POST":
      const post = await createPost(user, req.body);
      return res.send({ post });
    default:
      break;
  }
});
