import * as React from "react";
import { Switch, Route } from "react-router-dom";
import Loading from "../components/loading";

const Dashboard = React.lazy(() => import("./dashboard"));
const NewEntryPage = React.lazy(() => import("./new"));
const Preview = React.lazy(() => import("./preview"));
const Edit = React.lazy(() => import("./edit"));
const Legal = React.lazy(() => import("./legal"));
const Login = React.lazy(() => import("./login"));
const About = React.lazy(() => import("./about"));
const IndexPage = React.lazy(() => import("./index"));
const SettingsPage = React.lazy(() => import("./settings"));
const UnstableSlate = React.lazy(() => import("./slate"));

export enum Routes {
  DASHBOARD = "/dashboard",
  NEW = "/new",
  LOGIN = "/login",
  EDIT = "/edit/:id",
  PREVIEW = "/preview/:id",
  ABOUT = "/about",
  LEGAL = "/legal",
  SETTINGS = "/settings",
  SLATE = "/unstable_slate",
  INDEX = "/"
}

export function AppRoutes() {
  return (
    <React.Suspense fallback={<Loading size={50} />}>
      <Switch>
        <Route path={Routes.DASHBOARD} component={Dashboard} />
        <Route path={Routes.NEW} component={NewEntryPage} />
        <Route path={Routes.LOGIN} component={Login} />
        <Route path={Routes.EDIT} component={Edit} />
        <Route path={Routes.PREVIEW} component={Preview} />
        <Route path={Routes.ABOUT} component={About} />
        <Route path={Routes.LEGAL} component={Legal} />
        <Route path={Routes.SETTINGS} component={SettingsPage} />
        <Route path={Routes.SLATE} component={UnstableSlate} />
        <Route path={Routes.INDEX} exact component={IndexPage} />
      </Switch>
    </React.Suspense>
  );
}
