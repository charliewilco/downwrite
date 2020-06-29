import { createTestClient, ApolloServerTestClient } from "apollo-server-testing";
import { AllPostsDocument } from "../utils/generated";
/**
 * @jest-environment jsdom
 */
import { ApolloServer } from "apollo-server-micro";
import { schema } from "../lib/schema";

const testServer = new ApolloServer({
  schema: schema,
  context(c) {
    return c;
  }
});

const GraphQL: ApolloServerTestClient = createTestClient(testServer as any);

describe("GraphQL Server", () => {
  it("can query feed", async () => {
    const { data } = await GraphQL.query({
      query: AllPostsDocument
    });

    expect(Array.isArray(data!.feed)).toBeTruthy();
    expect(data!.feed[0].content).toBeUndefined();
  });
});
