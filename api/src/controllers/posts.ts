import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { draftToMarkdown } from 'markdown-draft-js';

import { PostModel as Post, IPost } from '../models/Post';
import { UserModel as User, IUser } from '../models/User';

// TODO: implement `Authorization: ${token}`
// TODO: remove user from the payload, get it from the
// const { user } = req.auth.credentials;

import { IRequest } from './types';

// PUT

export const updatePost = async (request: IRequest, reply: Hapi.ResponseToolkit) => {
  const { user } = request.auth.credentials;
  const { id } = request.params;
  const entry: IPost = Object.assign({}, { user }, <IPost>request.payload);

  try {
    const post: IPost = await Post.findOneAndUpdate(
      { id, user: { $eq: user } },
      entry,
      {
        upsert: true
      }
    );
    return post;
  } catch (err) {
    console.log(err);
    return Boom.internal('Internal MongoDB error', err);
  }
};

// GET

export const getPosts = async (
  req: IRequest,
  reply: Hapi.ResponseToolkit
): Promise<IPost[] | Boom<any>> => {
  const { user } = req.auth.credentials;

  try {
    const posts: IPost[] = await Post.find({ user: { $eq: user } });
    return posts;
  } catch (error) {
    return Boom.notFound();
  }
};

export const getSinglePost = async (
  request: IRequest,
  h: Hapi.ResponseToolkit
): Promise<IPost | Boom<any>> => {
  const id = request.params.id;
  const { user } = request.auth.credentials;

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

export const getMarkdown = async (req: IRequest) => {
  const { id } = req.params;
  const post = await Post.findOne({ id });
  const user = await User.findOne({ _id: post.user });

  const markdown = {
    id,
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

  if (!post.public) {
    return Boom.notFound(
      "This post is either not public or I couldn't even find it. Things are hard sometimes."
    );
  } else {
    return markdown;
  }
};

// POST
export const createPost = async (request: IRequest): Promise<IPost | Boom<any>> => {
  const { user } = request.auth.credentials;

  const entry: IPost = Object.assign({}, <IPost>request.payload, { user });

  try {
    const post: IPost = await Post.create(entry);
    return post;
  } catch (error) {
    return Boom.boomify(error, { message: 'Internal MongoDB error' });
  }
};

// DELETE
export const deletePost = async (
  request: IRequest,
  reply: Hapi.ResponseToolkit
): Promise<string | Boom<any>> => {
  const id = request.params.id;
  const { user } = request.auth.credentials;

  try {
    const post = await Post.findOneAndRemove({
      id,
      user: { $eq: user }
    });
    return `${post.title} was removed`;
  } catch (error) {
    return Boom.boomify(error, { message: 'Internal MongoDB error' });
  }
};
