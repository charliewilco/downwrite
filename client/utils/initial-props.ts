import { NextContext } from "next";
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
  ctx: NextContext<{ id: string; token: string }>
): Promise<Partial<IEditProps>> {
  const token = authMiddleware(ctx);

  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;
    host = serverURL;
  }

  const post = (await API.getPost(ctx.query.id, {
    token,
    host
  })) as Dwnxt.IPost;

  return {
    post,
    id: ctx.query.id
  };
}

export interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
}

export async function getInitialPostList(
  ctx: NextContext<{ token: string }>
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
  ctx: NextContext<{ id: string }>
): Promise<Partial<IPreviewProps>> {
  let { id } = ctx.query;
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
  ctx: NextContext<{ token: string }>
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
