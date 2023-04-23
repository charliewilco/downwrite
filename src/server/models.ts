import Mongoose from "mongoose";

export interface IPostModel extends Mongoose.Document {
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

export interface IUserModel extends Mongoose.Document {
	username: string;
	email: string;
	password: string;
	admin?: boolean;
	posts?: IPostModel[];
	gradient?: string[];
}

const postSchema = new Mongoose.Schema({
	id: String,
	title: String,
	author: String,
	content: Object,
	public: Boolean,
	dateAdded: Date,
	dateModified: Date,
	user: { type: Mongoose.Schema.Types.ObjectId, ref: "User" }
});

const userSchema = new Mongoose.Schema({
	username: { type: String, required: true, index: { unique: true } },
	email: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	admin: { type: Boolean, required: true },
	posts: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Post" }]
});

export const UserModel: Mongoose.Model<IUserModel> =
	Mongoose.models.User || Mongoose.model<IUserModel>("User", userSchema);
export const PostModel: Mongoose.Model<IPostModel> =
	Mongoose.models.Post || Mongoose.model<IPostModel>("Post", postSchema);
