import * as Hapi from "hapi";
import * as Axios from "axios";
import createServer from "../src/server";
import { prepareDB } from "../src/util/db";
import { ICreateResponse } from "../src/controllers/users";
import { IPost } from "../src/models/Post";
import { createdUser, createdPost, updatedTitle } from "./create-mocks";

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
let postID: string;

jest.setTimeout(100000);

describe("Server Endpoints Perform", () => {
  beforeAll(async () => {
    db = await prepareDB();
    server = await createServer(9999);
    server.start();
  });

  it("can create a user", async () => {
    const R: Axios.AxiosResponse<ICreateResponse> = await Axios.default.post(
      "http://localhost:9999/api/users",
      {
        ...createdUser
      }
    );

    token = (R.data as ICreateResponse).id_token;
    user = (R.data as ICreateResponse).userID;

    expect(R.status).toBeLessThanOrEqual(300);
  });

  it("can create a post", async () => {
    const R: Axios.AxiosResponse<ICreateResponse> = await Axios.default.post(
      "http://localhost:9999/api/posts",
      {
        ...createdPost,
        user
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    expect(R.status).toBeLessThanOrEqual(400);
    expect(R.status).toBeGreaterThanOrEqual(200);
  });

  it("can list posts and list post", async () => {
    const R: Axios.AxiosResponse<IPost[]> = await Axios.default.get(
      "http://localhost:9999/api/posts",
      {
        headers: {
          Authorization: token
        }
      }
    );

    expect(R.status).toBeLessThanOrEqual(400);

    expect(R.status).toBeGreaterThanOrEqual(200);
    expect(R.data).toHaveLength(1);

    const P: Axios.AxiosResponse<IPost> = await Axios.default.get(
      "http://localhost:9999/api/posts/" + R.data[0].id,
      {
        headers: {
          Authorization: token
        }
      }
    );

    expect(P.status).toBeLessThanOrEqual(400);
    expect(P.status).toBeGreaterThanOrEqual(200);
    expect(P.data).toBeTruthy();
    expect(P.data.title).toEqual(createdPost.title);

    postID = P.data.id;
  });

  it("can edit a post", async () => {
    const url: string = "http://localhost:9999/api/posts/" + postID;
    const body = Object.assign({}, createdPost, {
      user,
      title: updatedTitle,
      public: true
    } as Partial<IPost>);

    const R: Axios.AxiosResponse<IPost> = await Axios.default.put(
      url,
      {
        ...body
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    // Fake checks
    expect(R.status).toBeLessThanOrEqual(400);
    expect(R.status).toBeGreaterThanOrEqual(200);
    expect(R.data).toBeTruthy();

    // Real checks
    expect(R.data.id).toBe(postID);
    expect(R.data.title).toEqual(updatedTitle);
    expect(R.data.public).toEqual(body.public);
  });

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
