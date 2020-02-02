import { createTestClient, ApolloServerTestClient } from "apollo-server-testing";
import { testServer } from "../utils/graphql/server";
import { AllPostsDocument } from "../utils/generated";

const GraphQL: ApolloServerTestClient = createTestClient(testServer as any);

describe("GraphQL Server", () => {
  it("can query feed", async () => {
    const { data } = await GraphQL.query({
      query: AllPostsDocument
    });

    expect(Array.isArray(data.feed)).toBeTruthy();
    expect(data.feed[0].content).toBeUndefined();
  });
});
