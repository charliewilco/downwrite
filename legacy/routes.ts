import * as UserController from "./controllers/users";

const Routes = [
  {
    method: "GET",
    path: "/api/users",
    handler: UserController.getDetails
  },
  {
    method: "POST",
    path: "/api/users/settings",
    handler: UserController.updateNameEmail
  }
];

export default Routes;
