import { IPreview } from "../__generated__/server";
import dbConnect from "./db";
import { IPostModel, PostModel, UserModel } from "./models";
import { transformMDToPreview } from "./transform";

export const getAllPreviewEntries = async (): Promise<IPostModel[]> => {
  return PostModel.find({ public: true }).exec();
};

export const getPreviewEntry = async (id: string): Promise<IPreview> => {
  try {
    await dbConnect();

    const entry = await PostModel.findOne({ id });
    const user = await UserModel.findOne({ _id: entry!.user });
    return transformMDToPreview(entry, user);
  } catch (error) {
    throw new Error(error);
  }
};
