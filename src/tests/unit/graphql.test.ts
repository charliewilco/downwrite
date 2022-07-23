import { createServer } from "@graphql-yoga/node";
import base64 from "base-64";
import {
  CreateUserDocument,
  CreateEntryDocument,
  AllPostsDocument,
  EditDocument,
  UpdateEntryDocument
} from "./documents";
import { MockContext } from "./mock";

import { schema } from "@server/schema";
import { stopDB } from "@server/db";
import { VALID_PASSWORD } from "@shared/constants";

const serverContext = new MockContext();
const testServer = createServer<MockContext>({
  schema: schema,
  context() {
    return serverContext;
  }
});

beforeAll(async () => {});

afterAll(async () => {
  await stopDB();
});

describe("GraphQL API", () => {
  it("create user", async () => {
    const name = "charliex";

    const { executionResult } = await testServer.inject({
      document: CreateUserDocument,
      variables: {
        username: name,
        email: "test@charlieisamazing.com",
        password: base64.encode("password")
      },
      serverContext
    });

    const working = await testServer.inject({
      document: CreateUserDocument,
      variables: {
        username: name,
        email: "test@charlieisamazing.com",
        password: base64.encode("P@ssw0rd")
      },
      serverContext
    });
    if (executionResult.errors) {
      expect(executionResult.errors[0].message).toContain(VALID_PASSWORD);
    }
    if (working.executionResult.data?.createUser) {
      serverContext.setAuthorization(working.executionResult.data.createUser.token);
    }

    expect(working.executionResult.data?.createUser).not.toBeNull();
    expect(working.executionResult.data?.createUser.token).toEqual(
      serverContext.req.headers.authorization
    );
  });

  it("can add entry", async () => {
    const feedQuery = await testServer.inject({
      document: AllPostsDocument,
      serverContext
    });

    expect(feedQuery.executionResult.data?.feed).toEqual([]);
    expect(feedQuery.executionResult.errors).toBeUndefined();

    const { executionResult } = await testServer.inject({
      document: CreateEntryDocument,
      variables: {
        content: "> Hello!",
        title: "Something"
      },
      serverContext
    });

    const postQuery = await testServer.inject({
      document: EditDocument,
      variables: {
        id: executionResult.data?.createEntry.id
      },
      serverContext
    });

    expect(executionResult.data?.createEntry.id).not.toBeUndefined();
    expect(postQuery.executionResult.data?.entry.id).toEqual(
      executionResult.data?.createEntry.id
    );
  });

  it("can edit entry", async () => {
    const feedQuery = await testServer.inject({
      document: AllPostsDocument,
      serverContext
    });

    const entry = feedQuery.executionResult.data?.feed[0];

    const { executionResult } = await testServer.inject({
      document: UpdateEntryDocument,
      variables: {
        id: entry.id,
        title: "Updated Entry",
        status: entry.public,
        content: `> Hello Everyone!`
      },
      serverContext
    });

    expect(executionResult.data?.updateEntry.title).toBe("Updated Entry");
    expect(executionResult.data?.updateEntry.content).toBe(`> Hello Everyone!`);
  });

  it("can query feed", async () => {
    const { executionResult } = await testServer.inject({
      document: AllPostsDocument,
      serverContext
    });

    expect(executionResult.data?.feed).toHaveLength(1);
    expect(executionResult.errors).toBeUndefined();
  });

  it.todo("can remove post");
  it.todo("can reauthenticates");
});
