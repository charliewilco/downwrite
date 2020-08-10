import Boom from "@hapi/boom";
import { IPost, PostModel, UserModel } from "./models";
import * as Validations from "./validations";
import { draftToMarkdown } from "markdown-draft-js";

export const getPosts = async (user: string) => {
  try {
    const posts: IPost[] = await PostModel.find({ user: { $eq: user } }).lean();
    return posts;
  } catch (error) {
    throw Boom.notFound(error);
  }
};

export const createPost = async (user: string, body: any): Promise<IPost> => {
  const entry: IPost = Object.assign({}, <IPost>body, { user });

  try {
    const post: IPost = await PostModel.create(entry);
    return post;
  } catch (error) {
    throw Boom.boomify(error, { message: "Internal MongoDB error" });
  }
};

export const getPost = async (user: string, id: string) => {
  try {
    const post: IPost = await PostModel.findOne({
      id,
      user: { $eq: user }
    });
    return post;
  } catch (error) {
    throw Boom.badImplementation(error);
  }
};

export const getMarkdownPreview = async (id: string) => {
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

  if (!post.public) {
    throw Boom.notFound(
      "This post is either not public or I couldn't even find it. Things are hard sometimes."
    );
  } else {
    return markdown;
  }
};

export const updatePost = async (user: string, id: string, payload: any) => {
  await Validations.validPost.validateAsync(payload);

  const entry: IPost = Object.assign({}, { user }, <IPost>payload);
  try {
    const post: IPost = await PostModel.findOneAndUpdate(
      { id, user: { $eq: user } },
      entry,
      {
        upsert: true
      }
    );
    // NOTE: This is not the updated entry object.
    return post;
  } catch (err) {
    throw Boom.internal("Internal MongoDB error", err);
  }
};

export const removePost = async (user: string, id: string) => {
  try {
    const post = await PostModel.findOneAndRemove({
      id,
      user: { $eq: user }
    });
    return `${post.title} was removed`;
  } catch (err) {
    throw Boom.boomify(err, { message: "Something went wrong" });
  }
};
