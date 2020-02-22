import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import { createApolloClient } from "./utils/apollo/client";
import { AppRoutes } from "./pages/routes";
import { AppWrapper } from "./pages/app";

function App() {
  return (
    <BrowserRouter>
      <AppWrapper>
        <AppRoutes />
      </AppWrapper>
    </BrowserRouter>
  );
}

const client = createApolloClient();

render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,
  document.querySelector("#root")
);
