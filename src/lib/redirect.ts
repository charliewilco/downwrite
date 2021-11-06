import { RequestHandler } from "micro";
import { IncomingMessage, ServerResponse } from "http";

export const redirect = (
  res: ServerResponse,
  statusCode: number,
  location: string
) => {
  if (!res) {
    throw new Error("Response object required");
  }

  if (!statusCode) {
    throw new Error("Status code required");
  }

  if (!location) {
    throw new Error("Location required");
  }

  res.statusCode = statusCode;
  res.setHeader("Location", location);
  res.end();
};

export class Redirect {
  private _url: string;
  private _statusCode: number;

  constructor(url: string, statusCode: number = 302) {
    this._url = url;
    this._statusCode = statusCode;
  }

  private handleRedirect(_: IncomingMessage, res: ServerResponse) {
    console.log(this);
    if (!res) {
      throw new Error("Response object required");
    }

    if (!this._statusCode) {
      throw new Error("Status code required");
    }

    if (!location) {
      throw new Error("Location required");
    }

    res.statusCode = this._statusCode;
    res.setHeader("Location", this._url);
    res.end();
  }

  public createHandler(): RequestHandler {
    return (req, res) => this.handleRedirect(req, res);
  }
}
