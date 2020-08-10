import * as Dwnxt from "downwrite";

export interface IEditProps {
  id: string;
  title: string;
  post: Dwnxt.IPost;
  route?: {};
}

export interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
}

export interface IPreviewProps {
  authed: boolean;
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
