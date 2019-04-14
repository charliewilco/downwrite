import * as React from "react";
import * as Dwnxt from "downwrite";
import { NextContext } from "next";
import Head from "next/head";
import orderBy from "lodash/orderBy";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";
import {
  IDashboardAction,
  IDashboardState,
  initialState,
  reducer,
  DashboardAction,
  SelectedPost
} from "../reducers/dashboard";
import { AuthContext, IAuthContext } from "../components/auth";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
}

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export function DashboardUI(props: IDashboardProps) {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IDashboardState, IDashboardAction>
  >(reducer, { ...initialState(props.entries) });

  const { token } = React.useContext<IAuthContext>(AuthContext);

  React.useEffect(() => {
    if (isEmpty(state.entries)) {
      getPosts();
    }
  }, []);

  async function getPosts(close?: boolean): Promise<void> {
    const { host } = document.location;
    const entries = await API.getPosts({ token, host });

    if (Array.isArray(entries)) {
      dispatch({ type: DashboardAction.FETCH_ENTRIES, payload: { entries } });
    } else if (typeof entries === "object") {
      dispatch({
        type: DashboardAction.ERROR_BIG_TIME,
        payload: { errorMessage: entries }
      });
    }
  }

  async function onDelete({ id }: SelectedPost): Promise<void> {
    const { host } = document.location;

    const response = await API.removePost(id, { token, host });

    if (response.ok) {
      await getPosts(true);
    }
  }

  return (
    <>
      <Head>
        <title>
          {Array.isArray(state.entries) && state.entries.length} Entries | Downwrite
        </title>
      </Head>
      {state.modalOpen && !isEmpty(state.selectedPost) && (
        <DeleteModal
          title={state.selectedPost.title}
          onDelete={() => onDelete(state.selectedPost)}
          onCancelDelete={() => dispatch({ type: DashboardAction.CANCEL_DELETE })}
          closeModal={() => dispatch({ type: DashboardAction.CLOSE_MODAL })}
        />
      )}
      <section className="PostContainer">
        {state.loaded ? (
          Array.isArray(state.entries) && state.entries.length > 0 ? (
            <PostList
              onDelete={selectedPost =>
                dispatch({
                  type: DashboardAction.SELECT_POST,
                  payload: { selectedPost }
                })
              }
              posts={state.entries as Dwnxt.IPost[]}
            />
          ) : state.error.length > 0 ? (
            <InvalidToken error={state.error} />
          ) : (
            <EmptyPosts />
          )
        ) : (
          <Loading size={100} />
        )}
      </section>
    </>
  );
}

DashboardUI.getInitialProps = async function(
  ctx: NextContext<{ token: string }>
): Promise<Partial<IDashboardProps>> {
  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;
    host = serverURL;
  }

  const token = authMiddleware(ctx);
  const entries = await API.getPosts({ token, host });

  return {
    entries: orderBy(entries, ["dateModified"], ["desc"])
  };
};

DashboardUI.defaultProps = {
  entries: []
};

export default DashboardUI;
