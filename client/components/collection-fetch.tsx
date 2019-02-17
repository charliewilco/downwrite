import * as React from "react";
import orderBy from "lodash/orderBy";
import { AuthContext, IAuthContext } from "./auth";
import { SidebarEmpty } from "./empty-posts";
import SidebarPosts from "./sidebar-posts";
import * as API from "../utils/api";
import { IPost } from "downwrite";

interface FetchState {
  posts: IPost[];
  isLoading: boolean;
}

interface FetchAction {
  type: string;
  payload?: {
    posts: IPost[];
    error?: string;
  };
}

const reducer: React.Reducer<FetchState, FetchAction> = (state, action) => {
  switch (action.type) {
    case "fetched": {
      return { ...state, posts: action.payload.posts, isLoading: false };
    }
    case "fetching": {
      return { ...state, isLoading: true };
    }
    default: {
      return state;
    }
  }
};

const initialState: FetchState = {
  posts: [],
  isLoading: true
};

const CollectionFetch: React.FC = function() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { token } = React.useContext<IAuthContext>(AuthContext);

  React.useEffect(() => {
    const { host } = document.location;
    dispatch({ type: "fetching" });

    API.getPosts({ token, host }).then(posts => {
      if (Array.isArray(posts)) {
        dispatch({
          type: "fetched",
          payload: {
            posts: orderBy(posts, ["dateAdded"], ["desc"])
          }
        });
      } else {
        dispatch({
          type: "error",
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
    <SidebarEmpty />
  );
};

export default CollectionFetch;
