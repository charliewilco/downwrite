import * as PostController from "./controllers/posts";
import * as UserController from "./controllers/users";
import * as PostModel from "./models/Post";
import * as UserModel from "./models/User";

const cors = {
  origin: ["*"],
  credentials: true
};

const auth = {
  strategy: "jwt"
};

const urlCreator = (path: string) => `/api${path}`;

const Routes = [
  {
    method: "GET",
    path: "/api/posts",
    handler: PostController.getPosts,
    config: {
      cors,
      auth
    }
  },
  {
    method: "POST",
    path: "/api/posts",
    handler: PostController.createPost,
    config: {
      validate: {
        payload: PostModel.validPost
      },
      auth,
      cors
    }
  },
  {
    method: "GET",
    path: "/api/posts/{id}",
    handler: PostController.getSinglePost,
    config: {
      cors,
      auth
    }
  },
  {
    method: "GET",
    path: "/api/posts/preview/{id}",
    handler: PostController.getMarkdown,
    config: {
      cors
    }
  },
  {
    method: "DELETE",
    path: "/api/posts/{id}",
    handler: PostController.deletePost,
    config: {
      cors,
      auth
    }
  },
  {
    method: "PUT",
    path: "/api/posts/{id}",
    handler: PostController.updatePost,
    config: {
      validate: {
        payload: PostModel.validPost
      },
      auth,
      cors
    }
  },
  {
    method: "POST",
    path: "/api/password",
    handler: UserController.updatePassword,
    config: {
      validate: { payload: UserModel.validPasswordUpdate },
      pre: [
        {
          method: UserController.verifyValidPassword,
          assign: "user"
        }
      ],
      auth,
      cors
    }
  },
  {
    method: "POST",
    path: "/api/users",
    handler: UserController.createUser,
    config: {
      pre: [{ method: UserController.verifyUniqueUser }],
      validate: {
        payload: UserModel.validUser
      },
      cors
    }
  },
  {
    method: "GET",
    path: "/api/users",
    handler: UserController.getDetails,
    config: {
      cors,
      auth
    }
  },
  {
    method: "POST",
    path: "/api/users/settings",
    handler: UserController.updateNameEmail,
    config: {
      cors,
      auth
    }
  },
  {
    method: "POST",
    path: "/api/users/authenticate",
    config: {
      pre: [
        {
          method: UserController.verifyCredentials,
          assign: "user"
        }
      ],
      handler: UserController.authenticateUser,
      validate: {
        payload: UserModel.validAuthenticatedUser
      },
      cors
    }
  }
];

export default Routes;
