const { post, user, authUser } = require('./models')
const PostController = require('./controllers/posts')
const UserController = require('./controllers/users')
const { verifyUniqueUser, verifyCredentials } = require('./util/user')
const createToken = require('./util/token')

const cors = {
  origin: ['*'],
  credentials: true
}

const auth = {
  strategy: 'jwt'
}

module.exports = [
  {
    method: 'GET',
    path: '/posts',
    handler: PostController.getPosts,
    config: {
      cors,
      auth
    }
  },
  {
    method: 'POST',
    path: '/posts',
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
    path: '/posts/{id}',
    handler: PostController.getSinglePost,
    config: {
      cors,
      auth
    }
  },
  {
    method: 'GET',
    path: '/posts/preview/{id}',
    handler: PostController.getMarkdown,
    config: {
      cors
    }
  },
  {
    method: 'DELETE',
    path: '/posts/{id}',
    handler: PostController.deletePost,
    config: {
      cors,
      auth
    }
  },
  {
    method: 'PUT',
    path: '/posts/{id}',
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
    path: '/users',
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
    path: '/users/authenticate',
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
]
