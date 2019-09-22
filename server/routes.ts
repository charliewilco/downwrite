import * as Hapi from "@hapi/hapi";
import * as PostController from "./controllers/posts";
import * as UserController from "./controllers/users";
import {
  validAuthenticatedUser,
  validPasswordUpdate,
  validUser,
  validPost
} from "./models";

const cors = {
  origin: ["*"],
  credentials: true
};

const auth = {
  strategy: "jwt"
};

// const urlCreator = (path: string) => `/api${path}`;

// const Relish = require("relish")({
//   messages: {
//     "data.username": "Please enter a valid username",
//     "data.email": "email...",
//     "data.password": "this password does not work."
//   }
// });

// TODO: investigate how to attach types for cors and auth properly
export interface IHapiRoute extends Hapi.ServerRoute {
  config: Partial<
    | {
        validate?: Hapi.ValidationObject;
        auth: Hapi.ServerAuthConfig;
        cors: Hapi.RouteOptionsCors;
        pre: Hapi.RouteOptionsPreObject | Hapi.RouteOptionsPreArray;
      }
    | Hapi.ServerAuth
  >;
}

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
        payload: validPost
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
        payload: validPost
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
      validate: { payload: validPasswordUpdate },
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
        payload: validUser
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
        payload: validAuthenticatedUser
      },
      cors
    }
  }
];

export default Routes;
