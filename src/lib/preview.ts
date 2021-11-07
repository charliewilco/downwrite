import { IPreview } from "../__generated__/server";
import { IPostModel, PostModel, UserModel } from "./models";
import { transformMDToPreview } from "./transform";

export const getAllPreviewEntries = async (): Promise<IPostModel[]> => {
  return PostModel.find({ public: true }).exec();
};

export const getPreviewEntry = async (id: string): Promise<IPreview> => {
  const entry = await PostModel.findById(id);
  const user = await UserModel.findOne({ _id: entry!.user });
  return transformMDToPreview(entry, user);
};
