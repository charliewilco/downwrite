import * as React from "react";
import { render } from "react-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import { createApolloClient } from "./utils/apollo/client";

function App() {
  return (
    <div>
      <h1>Hello from the bad lands</h1>
    </div>
  );
}

const client = createApolloClient();

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.querySelector("#root")
);
