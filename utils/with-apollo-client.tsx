import withApollo from "next-with-apollo";
import ApolloClient, { InMemoryCache } from "apollo-boost";
import Cookies from "universal-cookie";

export default withApollo(({ ctx, headers, initialState }) => {
  const cookie = new Cookies(ctx.req);
  const token = cookie.get("DW_TOKEN");
  console.log(token);
  return new ApolloClient({
    uri: "http://localhost:3000/api/graphql",
    cache: new InMemoryCache().restore(initialState || {})
  });
});
