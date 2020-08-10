import * as Mongoose from "mongoose";

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

const UserSchema = new Mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true },
  posts: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Post" }]
});

export interface IUser extends Mongoose.Document {
  username: string;
  email: string;
  password: string;
  admin?: boolean;
  posts: IPost[];
  gradient?: string[];
}

export const UserModel =
  Mongoose.models.User || Mongoose.model<IUser>("User", UserSchema);
