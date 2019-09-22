import { NextApiResponse, NextApiRequest } from "next";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  console.log("Login!");
};
