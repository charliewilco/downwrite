import { createTestClient, ApolloServerTestClient } from "apollo-server-testing";
import { ApolloServer } from "apollo-server-micro";
import { schema } from "@lib/schema";
import { clearDB, stopDB } from "@lib/db";
import { MockContext } from "@lib/context";
import { validPasswordMessage } from "@utils/constants";
import * as GQL from "@utils/generated";

const serverContext = new MockContext();
const testServer = new ApolloServer({
  schema: schema,
  context() {
    return serverContext;
  }
});

const client: ApolloServerTestClient = createTestClient(testServer);

beforeAll(async () => {
  await clearDB();
});

afterAll(async () => {
  await stopDB();
});

describe("GraphQL API", () => {
  it("create user", async () => {
    const name = "charliex";

    const failed = await client.mutate<
      GQL.ICreateUserMutation,
      GQL.ICreateUserMutationVariables
    >({
      mutation: GQL.CreateUserDocument,
      variables: {
        username: name,
        email: "test@charlieisamazing.com",
        password: "password"
      }
    });

    const working = await client.mutate<
      GQL.ICreateUserMutation,
      GQL.ICreateUserMutationVariables
    >({
      mutation: GQL.CreateUserDocument,
      variables: {
        username: name,
        email: "test@charlieisamazing.com",
        password: "P@ssw0rd"
      }
    });
    expect(failed.errors[0].message).toContain(validPasswordMessage);
    if (working.data.createUser) {
      serverContext.setCookie(working.data.createUser.token);
    }

    expect(working.data.createUser).not.toBeNull();
    expect(working.data.createUser.token).toEqual(
      serverContext.req.cookies.DW_TOKEN
    );
  });

  it("can add entry", async () => {
    const feedQuery = await client.query<
      GQL.IAllPostsQuery,
      GQL.IAllPostsQueryVariables
    >({
      query: GQL.AllPostsDocument
    });

    expect(feedQuery.data.feed).toEqual([]);
    expect(feedQuery.errors).toBeUndefined();

    const { data } = await client.mutate<
      GQL.ICreateEntryMutation,
      GQL.ICreateEntryMutationVariables
    >({
      mutation: GQL.CreateEntryDocument,
      variables: {
        content: "> Hello!",
        title: "Something"
      }
    });

    const postQuery = await client.query<GQL.IEditQuery, GQL.IEditQueryVariables>({
      query: GQL.EditDocument,
      variables: {
        id: data.createEntry.id
      }
    });

    expect(data.createEntry.id).not.toBeUndefined();
    expect(postQuery.data.entry.id).toEqual(data.createEntry.id);
  });

  it("can edit entry", async () => {
    const feedQuery = await client.query<
      GQL.IAllPostsQuery,
      GQL.IAllPostsQueryVariables
    >({
      query: GQL.AllPostsDocument
    });

    const entry = feedQuery.data.feed[0];

    const { data } = await client.mutate<
      GQL.IUpdateEntryMutation,
      GQL.IUpdateEntryMutationVariables
    >({
      mutation: GQL.UpdateEntryDocument,
      variables: {
        id: entry.id,
        title: "Updated Entry",
        status: entry.public,
        content: `> Hello Everyone!`
      }
    });

    expect(data.updateEntry.title).toBe("Updated Entry");
    expect(data.updateEntry.content).toBe(`> Hello Everyone!`);
  });

  it("can query feed", async () => {
    const { errors, data } = await client.query<
      GQL.IAllPostsQuery,
      GQL.IAllPostsQueryVariables
    >({
      query: GQL.AllPostsDocument
    });

    expect(data.feed).toHaveLength(1);
    expect(errors).toBeUndefined();
  });

  it.todo("can remove post");
  it.todo("can reauthenticates");
});