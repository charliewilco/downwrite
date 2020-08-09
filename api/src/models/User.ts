import * as Mongoose from "mongoose";
import * as Joi from "@hapi/joi";
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

// 1. must contain 1 lowercase letter
// 2. must contain 1 uppercase letter
// 3. must contain 1 numeric character
// 4. must contain 1 special character
// 5. must contain 6 characters

const validPassword = Joi.string().regex(
  /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
);

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
  password: validPassword.required()
};

export const validPasswordUpdate = Joi.object().keys({
  oldPassword: Joi.string().required(),
  newPassword: validPassword.required(),
  confirmPassword: Joi.any().valid(Joi.ref("newPassword"))
});

export const validAuthenticatedUser = {
  user: Joi.alternatives()
    .try(
      Joi.string()
        .alphanum()
        .min(2)
        .max(30),
      Joi.string().email()
    )
    .required(),
  password: Joi.alternatives()
    .try(validPassword, Joi.string())
    .required()
};
