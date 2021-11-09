import { ServerResponse } from "http";

export class MockContext {
  public req: any;
  public res: Pick<ServerResponse, "setHeader">;
  constructor() {
    this.req = {
      headers: {
        authorization: ""
      }
    };

    this.res = {
      setHeader: (_name: string, value: any) => {
        console.log(_name, value);
        return {} as any;
      }
    };
  }

  setAuthorization(token: string) {
    this.req.headers.authorization = token;
  }
}
