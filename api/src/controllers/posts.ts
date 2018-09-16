import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { draftToMarkdown } from 'markdown-draft-js';

import Post from '../models/Post';
import User from '../models/User';

export interface ICredentials extends Hapi.AuthCredentials {
  id: string;
}

export interface IRequestAuth extends Hapi.RequestAuth {
  credentials: ICredentials;
}

export interface IRequest extends Hapi.Request {
  auth: IRequestAuth;
}

// PUT

export const updatePost = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const updatedPost = req.payload;
  const query = { id: updatedPost.id };

  Post.findOneAndUpdate(query, updatedPost, { upsert: true }, (err, post) => {
    if (err) {
      console.log(err);
      return reply(Boom.internal('Internal MongoDB error', err));
    } else {
      return reply(post);
    }
  });
};

// GET

export const getPosts = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const { user } = req.auth.credentials;

  Post.find({ user: { $eq: user } }).exec((error, posts) => {
    if (error) {
      reply(Boom.internal('Internal MongoDB error', error));
    }
    reply(posts);
  });
};

export const getSinglePost = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const user = req.auth.credentials;

  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      reply(Boom.internal('Internal MongoDB error', err));
    }

    if (post.author === user) {
      console.log('Maybe this is true');
    }

    reply(post);
  });
};

export const getMarkdown = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      return reply(Boom.internal('Internal MongoDB error', err));
    } else if (!post.public) {
      return reply(
        Boom.notFound(
          "This post is either not public or I couldn't even find it. Things are hard sometimes."
        )
      );
    } else {
      User.findOne({ _id: post.user }, (err, user) => {
        return reply({
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
        });
      });
    }
  });
};

// POST

export const createPost = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  const newPost = Object.assign({}, req.payload);
  const post = new Post(newPost);

  post.save((error, post) => {
    if (error) {
      return reply(Boom.wrap(error, 'Internal MongoDB error'));
    }

    reply(post);
  });
};

// DELETE
export const deletePost = (req: IRequest, reply: Hapi.ResponseToolkit) => {
  Post.findOneAndRemove({ id: req.params.id }, (err, post) => {
    if (err) {
      return reply(Boom.wrap(err, 'Internal MongoDB error'));
    }
    reply(`${post.title} was removed`);
  });
};
