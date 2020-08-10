import { NextApiResponse, NextApiRequest } from "next";
import { createUser, verifyUniqueUser } from "../../../legacy/users";
import { validUser } from "../../../legacy/validations";
import { dbConnect } from "../../../legacy/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  switch (req.method) {
    case "POST": {
      await validUser.validateAsync(req.body);
      let user = await verifyUniqueUser(req.body);
      let u = await createUser(user);
      res.send(u);
      break;
    }
    default:
      break;
  }
};
