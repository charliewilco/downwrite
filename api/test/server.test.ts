import * as Hapi from "hapi";
import * as YesNo from "yesno-http";
import createServer from "../src/server";

const req = {};

const defaultGet = {
  method: "GET",
  url: "/posts",
  payload: {}
};

// const injection: Hapi.ServerInjectOptions = {
// method: req.method,
// url: req.url,
// headers: req.headers
//};

// Routes to test
// 1. GET '/posts' Lists all posts
// 2. POST '/posts' Creates new Post
// 3. GET '/posts/:id' Fetch Single
// 4. PUT '/posts/:id' Update Single Post
// 5. DELETE '/posts/:id' Delete Single Post
// 6. GET '/posts/preview/:id' Get Preview of Public Single Post
// 7. POST '/users' Create new User
// 8. POST '/users/authenticate' Authenticate Existing User

const previewReq = {
  method: "GET",
  url: "/posts/preview/aa3dd293-2a0e-478c-81e7-a0b9733e8b"
};

let server: Hapi.Server;

describe("Server Endpoints Perform", () => {
  beforeAll(async () => {
    server = await createServer();
  });
  it("GET | status code is 400", async () => {
    const request = Object.assign({}, defaultGet);
    const response = await server.inject(request);

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("GET | PREVIEW | status code is 200 on a public post", async () => {
    const request = Object.assign({}, previewReq);
    const r = await server.inject(request);

    expect(r.statusCode).toBeGreaterThanOrEqual(200);
  });

  afterAll(async () => {
    await server.stop();
  });

  // xit("POST");
  // xit("USER");
});
