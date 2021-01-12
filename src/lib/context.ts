import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { TOKEN_NAME } from "@lib/cookie-managment";

export type ResolverContext = Pick<GetServerSidePropsContext, "req" | "res">;

export class MockContext {
  public req: Pick<NextApiRequest, "cookies">;
  public res: Pick<NextApiResponse, "setHeader">;
  constructor() {
    this.req = {
      cookies: {
        [TOKEN_NAME]: ""
      }
    };

    this.res = {
      setHeader: (_name: string, value: any) => {
        console.log(_name, value);
      }
    };
  }

  setCookie(token: string) {
    this.req.cookies[TOKEN_NAME] = token;
  }
}
