import { NextPageContext } from "next";
import * as Dwnxt from "downwrite";
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
