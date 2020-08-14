import { NextApiHandler } from "next";
import Boom from "@hapi/boom";
import { draftToMarkdown } from "markdown-draft-js";
import { IPost, PostModel, UserModel } from "./models";
import * as Validations from "./validations";
import { NextJWTHandler } from "./with-jwt";

export const getPosts = async (user: string) => {
  try {
    const posts: IPost[] = await PostModel.find({ user: { $eq: user } }).lean();
    return posts;
  } catch (error) {
    throw Boom.notFound(error);
  }
};

export const getPostsHandler: NextJWTHandler = async (req, res) => {
  const { user } = req.jwt;
  try {
    const posts = getPosts(user);
    res.send({ posts });
  } catch (error) {
    const e = Boom.boomify(error);
    res.status(e.output.statusCode).end(e.output.payload);
  }
};

export const createPostHandler: NextJWTHandler = async (req, res) => {
  const { user } = req.jwt;
  const entry: IPost = Object.assign({}, <IPost>req.body, { user });

  try {
    const post: IPost = await PostModel.create(entry);
    res.send(post);
  } catch (error) {
    const e = Boom.boomify(error, { message: "Internal MongoDB error" });
    res.status(e.output.statusCode).end(e.output.payload);
  }
};

export const getPost = async (user: string, id: string) => {
  const post = await PostModel.findOne({
    id,
    user: { $eq: user }
  }).lean();
  post!.content = JSON.stringify(post!.content);
  console.log("CONTENT", post!.content);
  return post;
};

export const getPostHandler: NextJWTHandler = async (req, res) => {
  const { user } = req.jwt;
  const id = Array.isArray(req.query.id) ? req.query.id.join("") : req.query.id;
  try {
    const post = await getPost(user, id);
    res.send(post);
  } catch (error) {
    const e = Boom.badImplementation(error);
    res.status(e.output.statusCode).end(e.output.payload);
  }
};

export const getMarkdownPreview = async (id: string) => {
  const post = await PostModel.findOne({ id });
  const user = await UserModel.findOne({ _id: post.user });

  if (!post.public) {
    throw Boom.notFound(
      "This post is either not public or I couldn't even find it. Things are hard sometimes."
    );
  }

  const markdown = {
    id,
    author: {
      username: user.username,
      avatar: user.gradient || ["#FEB692", "#EA5455"]
    },
    content:
      typeof post.content === "string"
        ? post.content
        : draftToMarkdown(post.content, {
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
    dateAdded: post.dateAdded.toDateString()
  };
  return markdown;
};

export const getPreviewHandler: NextApiHandler = async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id.join("") : req.query.id;

  try {
    const markdown = await getMarkdownPreview(id);
    res.send(markdown);
  } catch (err) {
    const e = Boom.internal("Internal MongoDB error", err);

    res.status(e.output.statusCode).end(e.output.payload);
  }
};

export const updatePostHandler: NextJWTHandler = async (req, res) => {
  const { user } = req.jwt;
  const id = Array.isArray(req.query.id) ? req.query.id.join("") : req.query.id;
  await Validations.validPost.validateAsync(req.body);

  const entry: IPost = Object.assign({}, { user }, <IPost>req.body);
  try {
    const post: IPost = await PostModel.findOneAndUpdate(
      { id, user: { $eq: user } },
      entry,
      {
        upsert: true
      }
    );
    // NOTE: This is not the updated entry object.
    res.send(post);
  } catch (err) {
    const e = Boom.internal("Internal MongoDB error", err);

    res.status(e.output.statusCode).end(e.output.payload);
  }
};

export const removePostHandler: NextJWTHandler = async (req, res) => {
  const { user } = req.jwt;
  const id = Array.isArray(req.query.id) ? req.query.id.join("") : req.query.id;

  try {
    const post = await PostModel.findOneAndRemove({
      id,
      user: { $eq: user }
    });
    res.send(`${post.title} was removed`);
  } catch (err) {
    const e = Boom.boomify(err, { message: "Something went wrong" });
    res.status(e.output.statusCode).end(e.output.payload);
  }
};
