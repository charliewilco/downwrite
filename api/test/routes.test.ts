import * as Hapi from "hapi";
import * as YesNo from "yesno-http";
import * as Draft from "draft-js";
import * as uuid from "uuid/v4";

import createServer from "../src/server";
import { prepareDB } from "../src/util/db";
import { ICreateResponse } from "../src/controllers/users";
import { IPost } from "../src/models/Post";
import { createdUser, createdPost } from "./create-mocks";

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
let token: string;
let user: string;
let db: any;

jest.setTimeout(100000);

describe("Server Endpoints Perform", () => {
  beforeAll(async () => {
    db = await prepareDB();
    server = await createServer();
    await server.start();
  });

  it("can create a user", async () => {
    const r: Hapi.ServerInjectResponse = await server.inject({
      method: "POST",
      url: "/api/users",
      payload: {
        ...createdUser
      }
    });

    token = (r.result as ICreateResponse).id_token;
    user = (r.result as ICreateResponse).userID;

    expect(r.statusCode).toBeLessThanOrEqual(300);
  });

  it("can create a post", async () => {
    const response: Hapi.ServerInjectResponse = await server.inject({
      method: "GET",
      url: "/api/posts",
      payload: {
        ...createdPost,
        user
      },
      headers: {
        Authorization: token
      }
    });

    expect(response.statusCode).toBeLessThanOrEqual(400);
    expect(response.statusCode).toBeGreaterThanOrEqual(200);
  });

  it("can list posts and list post", async () => {
    const r = await server.inject({
      method: "GET",
      url: "/api/posts",
      headers: {
        Authorization: token
      }
    });

    console.log(r.result);
    expect(r.statusCode).toBeLessThanOrEqual(400);

    expect(r.statusCode).toBeGreaterThanOrEqual(200);
    expect(r.result).toHaveLength(1);

    const p = await server.inject({
      method: "GET",
      url: "/api/posts/" + r.result[0].id,
      headers: {
        Authorization: token
      }
    });

    expect(p.statusCode).toBeLessThanOrEqual(400);
    expect(p.statusCode).toBeGreaterThanOrEqual(200);
    expect(p.result).toBeTruthy();
    expect((p.result as IPost).title).toEqual(createdPost.title);
    console.log(p.result);
  });

  // Edit Post
  // Preview Post
  // Delete Posts
  // Auth User

  // it("GET | PREVIEW | status code is 200 on a public post", async () => {
  //   const r = await server.inject({
  //     method: "GET",
  //     url: "/posts/preview/aa3dd293-2a0e-478c-81e7-a0b9733e8b"
  //   });

  //   expect(r.statusCode).toBeGreaterThanOrEqual(200);
  // });

  afterAll(async () => {
    await server.stop();
    db.disconnect();
  });
});
