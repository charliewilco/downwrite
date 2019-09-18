import * as Mongoose from "mongoose";
import * as Joi from "@hapi/joi";

const PostSchema = new Mongoose.Schema({
  id: String,
  title: String,
  author: String,
  content: Object,
  public: Boolean,
  dateAdded: Date,
  dateModified: Date,
  user: { type: Mongoose.Schema.Types.ObjectId, ref: "User" }
});

export interface IPost extends Mongoose.Document {
  id: string;
  title: string;
  author: string;
  content: any;
  public: boolean;
  dateAdded: Date;
  dateModified: Date;
  excerpt?: string;
  user: any;
}

export const PostModel =
  Mongoose.models.Post || Mongoose.model<IPost>("Post", PostSchema);

export const validPost = {
  id: Joi.string(),
  title: Joi.string(),
  content: Joi.object(),
  tags: Joi.array(),
  dateAdded: Joi.date(),
  dateModified: Joi.date(),
  user: Joi.string(),
  public: Joi.boolean()
};

const UserSchema = new Mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true },
  posts: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Post" }]
});

export const UserModel = Mongoose.models.User || Mongoose.model("User", UserSchema);

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
