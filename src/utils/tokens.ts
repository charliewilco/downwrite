import * as jwt from "jsonwebtoken";

interface IToken {
  user: string;
  name: string;
  scopes: any[];
}

const key: string = process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

export const verifyJWT = (token: string): Promise<IToken> => {
  return new Promise(resolve => resolve(<IToken>jwt.verify(token, key)));
};
