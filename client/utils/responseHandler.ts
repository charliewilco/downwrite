import Cookies from "universal-cookie";
import * as Draft from "draft-js";
import { __IS_BROWSER__ } from "./dev";

export const superConverter: Function = (content: Draft.RawDraftContentState) => {
  return content.hasOwnProperty("entityMap")
    ? Draft.convertFromRaw(content)
    : Draft.convertFromRaw({ blocks: content.blocks, entityMap: {} });
};

type HeaderMethod = "GET" | "PUT" | "POST" | "DELETE";

export const createHeader = (
  method: HeaderMethod = "GET",
  token: string
): RequestInit => {
  const Header = new Headers();

  token && Header.set("Authorization", token);
  Header.set("Content-Type", "application/json");

  return {
    method,
    headers: Header,
    mode: "cors",
    cache: "default"
  };
};

export const getToken = (req, query) => {
  const ck = new Cookies();

  const token = req
    ? req.universalCookies.cookies.DW_TOKEN
    : query.token || ck.get("DW_TOKEN");

  return { token };
};
