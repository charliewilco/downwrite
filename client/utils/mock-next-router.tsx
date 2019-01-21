import * as React from "react";
import PropTypes from "prop-types";
import Router, {
  RouterProps,
  UrlLike,
  EventChangeOptions,
  PopStateCallback
} from "next/router";

type EventName =
  | "routeChangeStart"
  | "routeChangeComplete"
  | "routeChangeError"
  | "beforeHistoryChange"
  | "hashChangeStart"
  | "hashChangeComplete";

interface RouteChangeError {
  cancelled: boolean;
}

type EventHandler = (url: string) => any;
type ErrorEventHandler = (err: RouteChangeError, url: string) => any;

export const mockRouter: RouterProps<any> = {
  components: {},
  asPath: "/",
  route: "/",
  pathname: "/",
  query: {},
  // TODO: Properly mock the following methods
  back() {},
  beforePopState(cb: PopStateCallback) {
    return true;
  },
  prefetch(url: string) {
    let foo = null as Promise<React.ComponentType<any>>;
    return foo;
  },
  push(href: string, as: any, options: any) {
    this.pathname = href;
    return new Promise(resolve => resolve());
  },
  reload(route: string) {
    let foo = null as Promise<void>;
    return foo;
  },
  replace(
    url: string | UrlLike,
    as?: string | UrlLike,
    options?: EventChangeOptions
  ) {
    let foo = null as Promise<boolean>;
    return foo;
  },
  events: {
    on: (eventName: EventName, handler?: EventHandler | ErrorEventHandler) => {
      let foo: void;

      return foo;
    },
    off: (eventName: EventName, handler?: EventHandler) => {
      let foo: void;

      return foo;
    }
  }
};

Router.router = mockRouter;

// https://github.com/zeit/next.js/issues/5205#issuecomment-422846339
export default class MockNextContext extends React.Component<any, any> {
  static childContextTypes = {
    headManager: PropTypes.object,
    router: PropTypes.object
  };

  getChildContext() {
    const { headManager, router } = this.props;
    return {
      headManager: {
        updateHead() {},
        ...headManager
      },
      router: Object.assign(mockRouter, router)
    };
  }

  render() {
    return this.props.children;
  }
}
