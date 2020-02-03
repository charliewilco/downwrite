import * as React from "react";

import { Redirect } from "react-router-dom";
import { AuthContext } from "../components/auth";

export default function IndexPage() {
  const [{ authed }] = React.useContext(AuthContext);

  return <Redirect to={authed ? "/dashboard" : "/login"} />;
}
