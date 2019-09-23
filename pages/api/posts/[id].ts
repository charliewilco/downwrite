import Boom from "@hapi/boom";
import * as jwt from "jsonwebtoken";
// import { send } from "micro";
import { PostModel, IPost } from "../../../server/models";
import { prepareDB } from "../../../server/util/db";
import { NextApiResponse, NextApiRequest } from "next";
import { send } from "micro";

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";

// UPDATE ENTRY
// GET ENTRIES

export const config = {
  api: {}
};

interface ITokenContent {
  user: string;
  name: string;
  scope?: "admin";
}

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  // NOTE: Must start server & and connect to DB
  let db = await prepareDB();

  const { id } = req.query;

  const token: ITokenContent = jwt.decode(
    req.headers.authorization
  ) as ITokenContent;

  switch (req.method) {
    case "GET": {
      try {
        const post: IPost = await PostModel.findOne({
          id,
          user: { $eq: token.user }
        });
        db.disconnect(() => console.log("Connection closed!"));

        res.status(200).json(post);
      } catch (error) {
        res.status(404).send(Boom.badImplementation(error));
      }

      break;
    }

    case "PUT": {
      const entry: IPost = Object.assign({}, { user: token.user }, <IPost>(
        JSON.parse(req.body)
      ));

      try {
        await PostModel.findOneAndUpdate({ id, user: { $eq: token.user } }, entry, {
          upsert: true
        }).then(() => send(res, 200, { message: "Post Updated" }));

        db.disconnect(() => console.log("Connection closed!"));
      } catch (err) {
        send(res, 500, Boom.internal("Internal MongoDB error", err));
      }
      break;
    }

    case "DELETE": {
      try {
        const post = await PostModel.findOneAndRemove({
          id,
          user: { $eq: token.user }
        });
        db.disconnect(() => console.log("Connection closed!"));

        res.status(200).send(`${post.title} was removed`);
      } catch (error) {
        res
          .status(500)
          .send(Boom.boomify(error, { message: "Internal MongoDB error" }));
      }
      break;
    }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // NOTE: Must stop server & close DB
  db.disconnect();
};
