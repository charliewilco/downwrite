import { post, user, authUser } from './models';
import * as PostController from './controllers/posts';
import * as UserController from './controllers/users';
import { verifyUniqueUser, verifyCredentials } from './util/user';

const cors = {
  origin: ['*'],
  credentials: true
};

const auth = {
  strategy: 'jwt'
};

const urlCreator = (path: string) => `/api${path}`;

const Routes = [
  {
    method: 'GET',
    path: urlCreator('/posts'),
    handler: PostController.getPosts,
    config: {
      cors,
      auth
    }
  },
  {
    method: 'POST',
    path: urlCreator('/posts'),
    handler: PostController.createPost,
    config: {
      validate: {
        payload: post
      },
      auth,
      cors
    }
  },
  {
    method: 'GET',
    path: urlCreator('/posts/{id}'),
    handler: PostController.getSinglePost,
    config: {
      cors,
      auth
    }
  },
  {
    method: 'GET',
    path: urlCreator('/posts/preview/{id}'),
    handler: PostController.getMarkdown,
    config: {
      cors
    }
  },
  {
    method: 'DELETE',
    path: urlCreator('/posts/{id}'),
    handler: PostController.deletePost,
    config: {
      cors,
      auth
    }
  },
  {
    method: 'PUT',
    path: urlCreator('/posts/{id}'),
    handler: PostController.updatePost,
    config: {
      validate: {
        payload: post
      },
      auth,
      cors
    }
  },
  {
    method: 'POST',
    path: urlCreator('/users'),
    handler: UserController.createUser,
    config: {
      pre: [{ method: verifyUniqueUser }],
      validate: {
        payload: user
      },
      cors
    }
  },
  {
    method: 'POST',
    path: urlCreator('/users/authenticate'),
    config: {
      pre: [
        {
          method: verifyCredentials,
          assign: 'user'
        }
      ],
      handler: UserController.authenticateUser,
      validate: {
        payload: authUser
      },
      cors
    }
  }
];

export default Routes;
