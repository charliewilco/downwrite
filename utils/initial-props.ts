import * as Dwnxt from "downwrite";

interface IEditPost extends Dwnxt.IPost {
  content: string;
}

export interface IEditProps {
  id: string;
  title: string;
  post: IEditPost;
  route?: {};
}

export interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
}

export interface IPreviewProps {
  url: string;
  entry: Dwnxt.IPreviewEntry | Dwnxt.IPreviewEntryError;
  id: string;
}

export interface IUserSettingsProps {
  user: {
    username: string;
    email: string;
  };
  token: string;
}
