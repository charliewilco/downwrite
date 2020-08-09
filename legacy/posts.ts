import Boom from "@hapi/boom";
import { PostModel as Post, IPost } from "./models/Post";
import { UserModel as User } from "./models/User";
import { draftToMarkdown } from "markdown-draft-js";

export const getPosts = async (user: string) => {
  try {
    const posts: IPost[] = await Post.find({ user: { $eq: user } }).lean();
    return posts;
  } catch (error) {
    return Boom.notFound(error);
  }
};

export const createPost = async (
  user: string,
  body: any
): Promise<IPost | Boom<any>> => {
  const entry: IPost = Object.assign({}, <IPost>body, { user });

  try {
    const post: IPost = await Post.create(entry);
    return post;
  } catch (error) {
    return Boom.boomify(error, { message: "Internal MongoDB error" });
  }
};

export const getPost = async (user: string, id: string) => {
  try {
    const post: IPost = await Post.findOne({
      id,
      user: { $eq: user }
    });
    return post;
  } catch (error) {
    return Boom.badImplementation(error);
  }
};

export const getMarkdownPreview = async (id: string) => {
  const post = await Post.findOne({ id });
  const user = await User.findOne({ _id: post.user });

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
    return Boom.notFound(
      "This post is either not public or I couldn't even find it. Things are hard sometimes."
    );
  } else {
    return markdown;
  }
};
