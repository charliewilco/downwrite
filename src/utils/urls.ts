import { __IS_DEV__, __IS_BROWSER__, __IS_TEST__ } from "./dev";

// const DEV_URL = "http://localhost:3000/api";
// const PROD_URL = "https://next.downwrite.us/api";
// const URL: string = __IS_DEV__ ? DEV_URL : PROD_URL;

export const SECRET_KEY =
  process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

const PORT: string = process.env.PORT!;

export const GRAPHQL_ENDPOINT = `http://localhost:${PORT || 3000}/api/graphql`;

export const REST_ENDPOINT = "http://localhost:4000/api";
