import * as React from "react";
import { NextContext } from "next";
import * as Dwnxt from "downwrite";
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

function initialState(entries?: Dwnxt.IPost[] | Dwnxt.IPostError): IDashboardState {
  return {
    entries: entries || [],
    error: "",
    loaded: (entries as Dwnxt.IPost[]).length > 0,
    modalOpen: false,
    selectedPost: null
  };
}

interface Action {
  type: string;
  payload?: {
    errorMessage?: Dwnxt.IPostError;
    selectedPost?: Dwnxt.IPost;
    entries?: Dwnxt.IPost[];
  };
}

const ERROR_BIG_TIME: string = "ERROR_BIG_TIME";
const SELECT_POST: string = "SELECT_POST";
const CANCEL_DELETE: string = "CANCEL_DELETE";
const FETCH_ENTRIES: string = "FETCH_ENTRIES";
const CLOSE_MODAL: string = "CLOSE_MODAL";

function reducer(state: IDashboardState, action: Action): IDashboardState {
  switch (action.type) {
    case SELECT_POST:
      return {
        ...state,
        modalOpen: true,
        selectedPost: action.payload.selectedPost
      };
    case CLOSE_MODAL:
      return {
        ...state,
        modalOpen: false
      };
    case "deleted":
      return {
        ...state,
        modalOpen: false,
        selectedPost: null
      };
    case ERROR_BIG_TIME:
      return {
        ...state,
        error: action.payload.errorMessage.message,
        loaded: true,
        selectedPost: null
      };
    case CANCEL_DELETE:
      return { ...state, modalOpen: false, selectedPost: null };
    case FETCH_ENTRIES:
      return {
        ...state,
        selectedPost: null,
        loaded: true,
        modalOpen: false,
        entries: orderBy(action.payload.entries, "dateModified", ["desc"])
      };

    default:
      throw new Error();
  }
}

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export function DashboardUI(props: IDashboardProps) {
  const [state, dispatch] = React.useReducer<React.Reducer<IDashboardState, Action>>(
    reducer,
    { ...initialState(props.entries) }
  );

  React.useEffect(() => {
    if (isEmpty(state.entries)) {
      getPosts();
    }
  }, []);

  async function getPosts(close?: boolean): Promise<void> {
    const { host } = document.location;
    const entries = await API.getPosts({ token: props.token, host });

    if (Array.isArray(entries)) {
      dispatch({ type: FETCH_ENTRIES, payload: { entries } });
    } else if (typeof entries === "object") {
      dispatch({ type: ERROR_BIG_TIME, payload: { errorMessage: entries } });
    }
  }

  async function onDelete({ id }: Dwnxt.IPost): Promise<void> {
    const { host } = document.location;

    const response = await API.removePost(id, { token: props.token, host });

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
          onCancelDelete={() => dispatch({ type: CANCEL_DELETE })}
          closeModal={() => dispatch({ type: CLOSE_MODAL })}
        />
      )}
      <PostContainer>
        {state.loaded ? (
          Array.isArray(state.entries) && state.entries.length > 0 ? (
            <PostList
              onDelete={selectedPost =>
                dispatch({ type: SELECT_POST, payload: { selectedPost } })
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
      </PostContainer>
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
