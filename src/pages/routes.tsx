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

export function AppRoutes() {
  return (
    <React.Suspense fallback={<Loading size={50} />}>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/new" component={NewEntryPage} />
        <Route path="/login" component={Login} />
        <Route path="/edit/:id" component={Edit} />
        <Route path="/preview/:id" component={Preview} />
        <Route path="/about" component={About} />
        <Route path="/legal" component={Legal} />
      </Switch>
    </React.Suspense>
  );
}
