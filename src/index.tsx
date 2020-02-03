import * as React from "react";
import { render } from "react-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import { createApolloClient } from "./utils/apollo/client";
import { AppRoutes } from "./pages/routes";
import { AppWrapper } from "./pages/app";

function App() {
  return (
    <AppWrapper>
      <AppRoutes />
    </AppWrapper>
  );
}

const client = createApolloClient();

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.querySelector("#root")
);
