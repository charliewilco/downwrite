import * as React from "react";
import orderBy from "lodash/orderBy";
import * as API from "../utils/api";
import "isomorphic-fetch";

interface FetchState {
  posts: any[];
}

interface FetchProps {
  sortResponse?: () => void;
  token: string;
  endpoint: string;
  children: (p: FetchState) => React.ReactNode;
}

export default class CollectionFetch extends React.Component<
  FetchProps,
  FetchState
> {
  state = {
    posts: []
  };

  static defaultProps = {
    sortResponse: (x: any[]) => x
  };

  // TODO: Move this to React Suspense!!
  // TODO: Or move to componentDidMount and add loading State
  async componentDidMount() {
    const posts = await API.getPosts({ token: this.props.token });

    this.setState({ posts: orderBy(posts, ["dateAdded"], ["desc"]) || [] });
  }

  render() {
    const { posts } = this.state;
    return this.props.children({ posts });
  }
}
