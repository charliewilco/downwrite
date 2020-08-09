import { NextPageContext } from "next";
import * as Dwnxt from "downwrite";
import orderBy from "lodash/orderBy";
import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

export interface IEditProps {
  id: string;
  title: string;
  post: Dwnxt.IPost;
  route?: {};
}

export async function getInitialPost(
  ctx: NextPageContext
): Promise<Partial<IEditProps>> {
  const token = authMiddleware(ctx);

  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;
    host = serverURL;
  }

  const id = ctx.query.id.toString();

  const post = (await API.getPost(id, {
    token,
    host
  })) as Dwnxt.IPost;

  return {
    post,
    id
  };
}

export interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
}

export async function getInitialPostList(
  ctx: NextPageContext
): Promise<Partial<IDashboardProps>> {
  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;
    host = serverURL;
  }

  const token = authMiddleware(ctx);
  const entries = await API.getPosts({ token, host });

  return {
    entries: orderBy(entries, ["dateModified"], ["desc"])
  };
}

export interface IPreviewProps {
  authed: boolean;
  url?: string;
  entry: Dwnxt.IPreviewEntry | Dwnxt.IPreviewEntryError;
  id: string;
}

export async function getInitialPreview(
  ctx: NextPageContext
): Promise<Partial<IPreviewProps>> {
  let id: string = ctx.query.id.toString();
  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;

    host = serverURL;
  }

  const entry = await API.findPreviewEntry(id, { host });

  return {
    id,
    entry,
    url: `https://next.downwrite.us/preview?id=${id}`
  };
}

export interface IUserSettingsProps {
  user: {
    username: string;
    email: string;
  };
  token: string;
}

export async function getInitialSettings(
  ctx: NextPageContext
): Promise<Partial<IUserSettingsProps>> {
  const token = authMiddleware(ctx);

  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;

    host = serverURL;
  }

  const user = await API.getUserDetails({ token, host });

  return {
    token,
    user
  };
}
