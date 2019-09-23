import Boom from "@hapi/boom";
import * as jwt from "jsonwebtoken";
// import { send } from "micro";
import { PostModel, IPost } from "../../../server/models";
import { prepareDB } from "../../../server/util/db";
import { NextApiResponse, NextApiRequest } from "next";
import { ValidEntryCreation } from "../../../utils/validations";

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";

// POST NEW ENTRY
// GET ALL ENTRIES

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

  const token: ITokenContent = jwt.decode(
    req.headers.authorization
  ) as ITokenContent;

  switch (req.method) {
    case "GET": {
      try {
        const posts: IPost[] = await PostModel.find({ user: { $eq: token.user } });
        db.disconnect(() => console.log("Connection closed!"));

        res.status(200).json(posts);
      } catch (error) {
        res.status(404).send(Boom.notFound());
      }
      break;
    }

    case "POST": {
      console.log(req.body, typeof req.body);
      try {
        const parsed = JSON.parse(req.body);
        const valid = await ValidEntryCreation.isValid(parsed);
        const entry: IPost = Object.assign({}, parsed, {
          user: token.user,
          dateAdded: new Date(),
          public: false
        });
        console.log("valid", valid);
        console.log("entry", entry);
        if (valid) {
          const post: IPost = await PostModel.create(entry);
          db.disconnect(() => console.log("Connection closed!"));

          res.status(200).json(post);
        }
      } catch (error) {
        res
          .status(500)
          .send(Boom.boomify(error, { message: "Internal MongoDB error" }));
      }
      break;
    }

    default: {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
};
