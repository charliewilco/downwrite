import * as Hapi from "@hapi/hapi";
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

export const urlCreator = (path: string) => `/api${path}`;

// const Relish = require("relish")({
//   messages: {
//     "data.username": "Please enter a valid username",
//     "data.email": "email...",
//     "data.password": "this password does not work."
//   }
// });

// TODO: investigate how to attach types for cors and auth properly
export interface IRoute extends Hapi.ServerRoute {
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
    path: "/api/posts/{id}",
    handler: PostController.getSinglePost,
    config: {
      cors,
      auth
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
    method: "GET",
    path: "/api/posts/preview/{id}",
    handler: PostController.getMarkdown,
    config: {
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
