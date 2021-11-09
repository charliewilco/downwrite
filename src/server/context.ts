import { ServerResponse, IncomingMessage } from "http";

export type ResolverContext = {
  req: IncomingMessage;
  res: ServerResponse;
};
