import { NextApiRequest, NextApiResponse } from "next";
import { withJWT } from "../../../legacy/with-jwt";
import Config from "../../../legacy/util/config";
import { getPosts, createPost, getPost } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

export default withJWT(
  Config.key
)((req, res) => {
  const { user } = req.jwt;
  const {id} = req.query
  await dbConnect();


  switch (req.method) {
    case "GET":
      const post = await getPost(user, id);
      return res.send({ post });
    case "PUT":
      break;
    default:

  }
});
