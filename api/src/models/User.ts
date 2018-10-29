import * as Mongoose from "mongoose";
import * as Joi from "joi";
import { IPost } from "./Post";

const UserSchema = new Mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true },
  posts: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Post" }]
});

export default Mongoose.model("User", UserSchema);

export interface IUser extends Mongoose.Document {
  username: string;
  email: string;
  password: string;
  admin?: boolean;
  posts: IPost[];
  gradient?: string[];
}

export const UserModel = Mongoose.model<IUser>("User", UserSchema);

export const validUser = {
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required()
};

export const validAuthenticatedUser = {
  user: Joi.alternatives().try(
    Joi.string()
      .alphanum()
      .min(2)
      .max(30),
    Joi.string().email()
  ),
  password: Joi.string().required()
};
