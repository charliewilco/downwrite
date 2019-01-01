import * as React from "react";
import { NextContext } from "next";
import * as Dwnxt from "../types/downwrite";
import Head from "next/head";
import orderBy from "lodash/orderBy";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";
import DeleteModal from "../components/delete-modal";
import PostList, { PostContainer } from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

// type Res = Dwnxt.IPostError | Dwnxt.IPost[];

interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
  token: string;
}

interface IDashboardState {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
  loaded: boolean;
  selectedPost?: Dwnxt.IPost;
  modalOpen: boolean;
  error: string;
}

export default class Dashboard extends React.Component<
  IDashboardProps,
  IDashboardState
> {
  static displayName = "Dashboard";

  static defaultProps: Partial<IDashboardProps> = {
    entries: []
  };

  static async getInitialProps(
    ctx: NextContext<{ token: string }>
  ): Promise<Partial<IDashboardProps>> {
    const token = authMiddleware(ctx);
    const entries = await API.getPosts({ token });

    return {
      entries
    };
  }

  public readonly state: IDashboardState = {
    entries: this.props.entries,
    loaded: (this.props.entries as Dwnxt.IPost[]).length > 0,
    modalOpen: false,
    selectedPost: null,
    error: ""
  };

  // TODO: Fix this
  private getPosts = async (close?: boolean): Promise<void> => {
    const { token } = this.props;

    const entries = await API.getPosts({ token });

    if (Array.isArray(entries)) {
      this.setState({
        entries: orderBy(entries, ["dateAdded"], ["desc"]),
        selectedPost: null,
        loaded: true,
        modalOpen: !close
      });
    } else if (typeof entries === "object") {
      this.setState({
        error: entries.message,
        loaded: true,
        selectedPost: null
      });
    }
  };

  public componentDidMount(): void {
    if (isEmpty(this.state.entries)) {
      this.getPosts();
    }
  }

  private closeUIModal = (): void => {
    this.setState({ modalOpen: false });
  };

  private onDelete = async ({ id }: Partial<Dwnxt.IPost>): Promise<void> => {
    const { token } = this.props;
    const response = await API.removePost(id, { token });

    if (response.ok) {
      await this.getPosts(true);
    }
  };

  private cancelDelete = (): void => {
    this.setState({ selectedPost: null, modalOpen: false });
  };

  private confirmDelete = (post: Dwnxt.IPost): void => {
    this.setState({ selectedPost: post, modalOpen: true });
  };

  // TODO: refactor to have selected post, deletion to be handled by a lower level component
  // should be opened at this level and be handed a token and post to delete
  public render(): JSX.Element {
    const { modalOpen, loaded, entries, error, selectedPost } = this.state;

    return (
      <>
        <Head>
          <title>
            {Array.isArray(entries) && entries.length} Entries | Downwrite
          </title>
        </Head>
        {modalOpen && !isEmpty(selectedPost) && (
          <DeleteModal
            title={selectedPost.title}
            onDelete={() => this.onDelete(selectedPost)}
            onCancelDelete={this.cancelDelete}
            closeModal={this.closeUIModal}
          />
        )}
        <PostContainer>
          {loaded ? (
            Array.isArray(entries) && entries.length > 0 ? (
              <PostList onDelete={this.confirmDelete} posts={entries} />
            ) : error.length > 0 ? (
              <InvalidToken error={error} />
            ) : (
              <EmptyPosts />
            )
          ) : (
            <Loading size={100} />
          )}
        </PostContainer>
      </>
    );
  }
}
