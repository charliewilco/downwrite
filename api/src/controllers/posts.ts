import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { draftToMarkdown } from 'markdown-draft-js';

import { PostModel as Post, IPost } from '../models/Post';
import { UserModel as User, IUser } from '../models/User';

export interface ICredentials extends Hapi.AuthCredentials {
  id: string;
  user: string;
}

export interface IRequestAuth extends Hapi.RequestAuth {
  credentials: ICredentials;
}

export interface IRequest extends Hapi.Request {
  auth: IRequestAuth;
}

// PUT

export const updatePost = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const updatedPost: IPost | any = req.payload;
  const query = { id: updatedPost.id };

  Post.findOneAndUpdate(query, updatedPost, { upsert: true }, (err, post) => {
    if (err) {
      console.log(err);
      return Boom.internal('Internal MongoDB error', err);
    } else {
      return post;
    }
  });
};

// GET

export const getPosts = async (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const { user } = req.auth.credentials;

  console.log(req.auth.credentials);

  const posts: IPost[] = await Post.find({ user: { $eq: user } });

  if (posts) {
    return posts;
  } else {
    return Boom.notFound();
  }
};

export const getSinglePost = async (
  req: IRequest,
  reply: Hapi.ResponseToolkit
): Promise<IPost> => {
  const user = req.auth.credentials;

  const entry: IPost = await Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      return Boom.internal('Internal MongoDB error', err);
    }

    return post;
  });

  return entry;
};

export const getMarkdown = async (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const markdown = await Post.findOne({ id: req.params.id }, async (err, post) => {
    if (err) {
      return Boom.internal('Internal MongoDB error', err);
    } else if (!post.public) {
      return Boom.notFound(
        "This post is either not public or I couldn't even find it. Things are hard sometimes."
      );
    } else {
      const user = await User.findOne({ _id: post.user }, (err, user) => {
        return user;
      });

      return {
        id: req.params.id,
        author: {
          username: user.username,
          avatar: user.gradient || ['#FEB692', '#EA5455']
        },
        content: draftToMarkdown(post.content, {
          entityItems: {
            LINK: {
              open: () => {
                return '[';
              },

              close: entity => {
                return `](${entity.data.url || entity.data.href})`;
              }
            }
          }
        }),
        title: post.title,
        dateAdded: post.dateAdded
      };
    }
  });

  return markdown;
};

// POST

export const createPost = async (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const newPost = Object.assign({}, req.payload);
  const post = new Post(newPost);

  const entry = await post.save((error, post) => {
    if (error) {
      return Boom.boomify(error, { message: 'Internal MongoDB error' });
    }

    return post;
  });

  return entry;
};

// DELETE
export const deletePost = async (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const response = await Post.findOneAndRemove(
    { id: req.params.id },
    (err, post: IPost) => {
      if (err) {
        return Boom.boomify(err, { message: 'Internal MongoDB error' });
      }

      return `${post.title} was removed`;
    }
  );

  return response;
};
