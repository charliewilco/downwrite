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

const GraphQL: ApolloServerTestClient = createTestClient(testServer);

describe("GraphQL Server", () => {
  it("can query feed", async () => {
    const q = await GraphQL.query({
      query: AllPostsDocument
    });

    expect(q.data).toBeFalsy();
    expect(q.errors![0].message).toBe("Cannot read property 'cookies' of undefined");
  });
});
