/* eslint-disable no-console */
const express = require("express");
const jwt = require("jsonwebtoken");
const proxy = require("http-proxy-middleware");
const cookiesMiddleware = require("universal-cookie-express");
const next = require("next");
const { parse } = require("url");
const { join } = require("path");
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let key = process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

const verifyJWT = token => new Promise(resolve => resolve(jwt.verify(token, key)));

const isNotLoggedIn = async (req, res, next) => {
  const token = req.universalCookies.get("DW_TOKEN");

  if (token) {
    const { user } = await verifyJWT(token);

    return user && next();
  }

  return res.redirect("/login");
};

const API_URL = dev ? "http://0.0.0.0:4888" : "https://api.downwrite.us";

app.prepare().then(() => {
  const server = express();

  server.use(cookiesMiddleware());

  server.get("/", isNotLoggedIn, (req, res) =>
    app.render(req, res, "/", req.params)
  );

  server.get("/new", isNotLoggedIn, (req, res) => app.render(req, res, "/new"));
  server.get("/login", (req, res) => app.render(req, res, "/login"));
  server.get("/:id/edit", isNotLoggedIn, (req, res) =>
    app.render(req, res, "/edit", req.params)
  );
  server.get("/:id/preview", (req, res) =>
    app.render(req, res, "/preview", req.params)
  );

  server.use("/api", proxy({ target: API_URL, changeOrigin: true }));

  server.get("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname === "/service-worker.js") {
      const filePath = join(__dirname, ".next", pathname);
      res.setHeader("Service-Worker-Allowed", "/");
      app.serveStatic(req, res, filePath);
    } else {
      handle(req, res, parsedUrl);
    }
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
