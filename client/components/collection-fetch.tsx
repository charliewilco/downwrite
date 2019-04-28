import * as React from "react";
import Router from "next/router";
import orderBy from "lodash/orderBy";
import { AuthContext, IAuthContext } from "./auth";
import { Button } from "./button";
import SidebarPosts from "./sidebar-posts";
import * as API from "../utils/api";
import { IPost } from "downwrite";

enum FetchActions {
  FETCH_COMPLETED = "FETCH_COMPLETED",
  FETCH_INIT = "FETCH_INIT",
  FETCH_ERROR = "FETCH_ERROR"
}

interface IFetchState {
  posts: IPost[];
  isLoading: boolean;
  error?: string;
}

interface IFetchAction {
  type: FetchActions;
  payload?: {
    posts: IPost[];
    error?: string;
  };
}

const reducer: React.Reducer<IFetchState, IFetchAction> = (
  state,
  action
): IFetchState => {
  switch (action.type) {
    case FetchActions.FETCH_COMPLETED: {
      return { ...state, posts: action.payload.posts, isLoading: false };
    }
    case FetchActions.FETCH_INIT: {
      return { ...state, isLoading: true };
    }
    case FetchActions.FETCH_ERROR: {
      return {
        posts: action.payload.posts,
        isLoading: false,
        error: action.payload.error
      };
    }
    default: {
      return state;
    }
  }
};

const initialState: IFetchState = {
  posts: [],
  isLoading: true,
  error: ""
};

export default function CollectionFetch() {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IFetchState, IFetchAction>
  >(reducer, initialState);

  const { token } = React.useContext<IAuthContext>(AuthContext);

  React.useEffect(() => {
    const { host } = document.location;
    dispatch({ type: FetchActions.FETCH_INIT });

    API.getPosts({ token, host }).then(posts => {
      if (Array.isArray(posts)) {
        dispatch({
          type: FetchActions.FETCH_COMPLETED,
          payload: {
            posts: orderBy(posts, ["dateAdded"], ["desc"])
          }
        });
      } else {
        dispatch({
          type: FetchActions.FETCH_ERROR,
          payload: {
            posts: [],
            error: "Can't receieve posts"
          }
        });
      }
    });

    return function cleanup() {
      API.abortFetching();
    };
  }, [token]);

  return state.posts.length > 0 ? (
    <SidebarPosts posts={state.posts} />
  ) : (
    <div
      style={{
        paddingTop: 64,
        display: "flex",
        alignItems: "center",
        flexDirection: "column"
      }}>
      <Button onClick={() => Router.push("/new")}>Get Started</Button>
    </div>
  );
}
