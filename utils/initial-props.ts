import { NextPageContext } from "next";
import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

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
