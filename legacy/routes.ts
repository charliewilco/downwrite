import * as UserController from "./controllers/users";
import * as Validations from "./validations";

const cors = {
  origin: ["*"],
  credentials: true
};

const auth = {
  strategy: "jwt"
};

export const urlCreator = (path: string) => `/api${path}`;

const Routes = [
  {
    method: "POST",
    path: "/api/password",
    handler: UserController.updatePassword,
    config: {
      validate: { payload: Validations.validPasswordUpdate },
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
  }
];

export default Routes;
