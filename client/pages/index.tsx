import * as React from "react";
import * as Dwnxt from "../types/downwrite";
import Head from "next/head";
import orderBy from "lodash/orderBy";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";
import DeleteModal from "../components/delete-modal";
import PostList, { ListContainer } from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import * as API from "../utils/api";
import { getToken } from "../utils/responseHandler";

type Res = Dwnxt.IPostError | Dwnxt.IPost[];

interface DashboardPr {
  entries: Dwnxt.IPost[];
  token: string;
}

interface DashboardState {
  entries: Res;
  loaded: boolean;
  selectedPost?: Dwnxt.IPost | {};
  modalOpen: boolean;
  error: string;
}

export default class Dashboard extends React.Component<DashboardPr, DashboardState> {
  static displayName = "Dashboard";

  static defaultProps = {
    entries: []
  };

  static async getInitialProps({ req, query }) {
    const { token } = getToken(req, query);
    const entries = await API.getPosts({ token });

    return {
      entries
    };
  }

  state = {
    entries: this.props.entries,
    loaded: this.props.entries.length > 0,
    modalOpen: false,
    selectedPost: {} as Dwnxt.IPost,
    error: ""
  };

  // TODO: Fix this
  getPosts = async (close?: boolean) => {
    const { token } = this.props;

    const entries = await API.getPosts({ token });

    if (Array.isArray(entries)) {
      return this.setState({
        entries: orderBy(entries, ["dateAdded"], ["desc"]),
        selectedPost: {},
        loaded: true,
        modalOpen: !close
      });
    } else if (typeof entries === "object") {
      return this.setState({
        error: entries.message,
        loaded: true,
        selectedPost: {}
      });
    }
  };

  componentDidMount() {
    if (isEmpty(this.state.entries)) {
      this.getPosts();
    }
  }

  closeUIModal = () => this.setState({ modalOpen: false });

  onDelete = async ({ id }: Dwnxt.IPost) => {
    const { token } = this.props;
    const response = await API.removePost(id, { token });

    if (response.ok) {
      return await this.getPosts(true);
    }
  };

  cancelDelete = () => this.setState({ selectedPost: {}, modalOpen: false });

  confirmDelete = (post: Dwnxt.IPost | {}) =>
    this.setState({ selectedPost: post, modalOpen: true });

  // TODO: refactor to have selected post, deletion to be handled by a lower level component
  // should be opened at this level and be handed a token and post to delete
  render() {
    const { modalOpen, loaded, entries, error, selectedPost } = this.state;

    return (
      <>
        <Head>
          <title>{entries.length} Entries | Downwrite</title>
        </Head>
        {modalOpen && !isEmpty(selectedPost) && (
          <DeleteModal
            title={selectedPost.title}
            onDelete={() => this.onDelete(selectedPost)}
            onCancelDelete={this.cancelDelete}
            closeModal={this.closeUIModal}
          />
        )}
        <ListContainer>
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
        </ListContainer>
      </>
    );
  }
}
