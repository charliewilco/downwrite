import { createTestClient } from "apollo-server-testing";
import { testServer } from "../utils/graphql";
import { AllPostsDocument } from "../utils/generated";

const GraphQL = createTestClient(testServer);

describe("GraphQL Server", () => {
  it("can query feed", async () => {
    const { data } = await GraphQL.query({
      query: AllPostsDocument
    });

    expect(Array.isArray(data.feed)).toBeTruthy();
    expect(data.feed[0].content).toBeUndefined();
  });
});
