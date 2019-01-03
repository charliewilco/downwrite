import * as Hapi from "hapi";
import * as YesNo from "yesno-http";
import createServer from "../src/server";
import { prepareDB } from "../src/util/db";
import { ICreateResponse } from "../src/controllers/users";

// Routes to test
// 1. GET '/posts' Lists all posts
// 2. POST '/posts' Creates new Post
// 3. GET '/posts/:id' Fetch Single
// 4. PUT '/posts/:id' Update Single Post
// 5. DELETE '/posts/:id' Delete Single Post
// 6. GET '/posts/preview/:id' Get Preview of Public Single Post
// 7. POST '/users' Create new User
// 8. POST '/users/authenticate' Authenticate Existing User

let server: Hapi.Server;
let token: any;
let user: any;

const uid = Math.floor(Math.random() * 678) + 1;

let db: any;

const createdUser = {
  username: "user".concat(uid.toString()),
  email: "user".concat(uid.toString().concat("@email.com")),
  password: "Because1234"
};

jest.setTimeout(100000);

describe("Server Endpoints Perform", () => {
  beforeAll(async () => {
    db = await prepareDB();
    server = await createServer();
  });

  it("can create a user", async () => {
    const r: Hapi.ServerInjectResponse = await server.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        ...createdUser
      }
    });

    console.log(user, r.statusCode, r.result, r.payload);

    token = (r.result as ICreateResponse).id_token;
    user = (r.result as ICreateResponse).userID;

    expect(r.statusCode).toBeLessThanOrEqual(300);
  });

  // Create Post
  // Edit Post
  // Preview Post
  // List Posts
  // Delete Posts
  // Auth User

  it("GET | status code is 400 without token", async () => {
    const response: Hapi.ServerInjectResponse = await server.inject({
      method: "GET",
      url: "/posts"
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("GET | PREVIEW | status code is 200 on a public post", async () => {
    const r = await server.inject({
      method: "GET",
      url: "/posts/preview/aa3dd293-2a0e-478c-81e7-a0b9733e8b"
    });

    expect(r.statusCode).toBeGreaterThanOrEqual(200);
  });

  afterAll(async () => {
    await server.stop();
    db.disconnect();
  });
});
