import Boom from "@hapi/boom";
import { draftToMarkdown } from "markdown-draft-js";
import { send } from "micro";
import { PostModel, UserModel } from "../../../server/models";
import { NextApiRequest, NextApiResponse } from "next";
import { prepareDB } from "../../../server/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const db = await prepareDB();

  const { id } = req.query;

  const post = await PostModel.findOne({ id });
  const user = await UserModel.findOne({ _id: post.user });

  const markdown = {
    id,
    author: {
      username: user.username,
      avatar: user.gradient || ["#FEB692", "#EA5455"]
    },
    content: draftToMarkdown(post.content, {
      entityItems: {
        LINK: {
          open: () => {
            return "[";
          },

          close: (entity: any) => {
            return `](${entity.data.url || entity.data.href})`;
          }
        }
      }
    }),
    title: post.title,
    dateAdded: post.dateAdded
  };

  db.disconnect(() => console.log("Connection closed!"));

  if (!post.public) {
    send(
      res,
      404,
      Boom.notFound(
        "This post is either not public or I couldn't even find it. Things are hard sometimes."
      )
    );
  } else {
    send(res, 200, markdown);
  }
};
