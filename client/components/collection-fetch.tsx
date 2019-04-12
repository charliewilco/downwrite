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

interface FetchState {
  posts: IPost[];
  isLoading: boolean;
  error?: string;
}

interface FetchAction {
  type: FetchActions;
  payload?: {
    posts: IPost[];
    error?: string;
  };
}

const reducer: React.Reducer<FetchState, FetchAction> = (
  state,
  action
): FetchState => {
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

const initialState: FetchState = {
  posts: [],
  isLoading: true,
  error: ""
};

export default function CollectionFetch() {
  const [state, dispatch] = React.useReducer<React.Reducer<FetchState, FetchAction>>(
    reducer,
    initialState
  );

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
    <div className="FlexColumn">
      <Button onClick={() => Router.push("/new")}>Get Started</Button>
      <style jsx>{`
        .FlexColumn {
          padding-top: 64px;

          display: flex;
          align-items: center;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
