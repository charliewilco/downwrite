import * as React from "react";
import orderBy from "lodash/orderBy";
import { AuthContext, IAuthContext } from "./auth";
import * as API from "../utils/api";
import "isomorphic-fetch";
import { IPost } from "downwrite";

interface IFetchState {
  posts: IPost[];
}

type FetchRenderProps = (p: IFetchState) => React.ReactNode;

interface IFetchProps {
  sortResponse?: () => void;
  children: FetchRenderProps;
}

export default class CollectionFetch extends React.Component<
  IFetchProps,
  IFetchState
> {
  public readonly state: IFetchState = {
    posts: []
  };

  public static contextType: React.Context<IAuthContext> = AuthContext;

  public static defaultProps = {
    sortResponse: (x: any[]) => x
  };

  // TODO: Move this to React Suspense!!
  // TODO: Or move to componentDidMount and add loading State
  public async componentDidMount(): Promise<void> {
    const { token } = this.context;
    const { host } = document.location;
    const posts = await API.getPosts({ token, host });

    this.setState({ posts: orderBy(posts, ["dateAdded"], ["desc"]) || [] });
  }

  public render() {
    const { posts } = this.state;
    return this.props.children({ posts });
  }
}
