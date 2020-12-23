import { createTestClient, ApolloServerTestClient } from "apollo-server-testing";
import {
  AllPostsDocument,
  CreateUserDocument,
  ICreateUserMutationVariables,
  ICreateUserMutation
} from "../utils/generated";
import { ApolloServer } from "apollo-server-micro";
import { schema } from "../lib/schema";
import { clearDB, stopDB } from "@lib/db";
import { MockContext } from "@lib/context";
import { validPasswordMessage } from "@utils/constants";

const serverContext = new MockContext();
const testServer = new ApolloServer({
  schema: schema,
  context() {
    return serverContext;
  }
});

const { query, mutate }: ApolloServerTestClient = createTestClient(testServer);

beforeAll(async () => {
  await clearDB();
});

afterAll(async () => {
  await stopDB();
});

describe("GraphQL Server", () => {
  it("create user", async () => {
    const name = "charliex";

    const failed = await mutate<ICreateUserMutation, ICreateUserMutationVariables>({
      mutation: CreateUserDocument,
      variables: {
        username: name,
        email: "test@charlieisamazing.com",
        password: "password"
      }
    });

    const working = await mutate<ICreateUserMutation, ICreateUserMutationVariables>({
      mutation: CreateUserDocument,
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

  it("can query feed", async () => {
    const { errors, data } = await query({
      query: AllPostsDocument
    });

    expect(data.feed).toEqual([]);
    expect(errors).toBeUndefined();
  });
});
