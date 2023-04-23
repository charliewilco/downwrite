import { ApolloServer } from "apollo-server-micro";
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
const testServer = new ApolloServer({
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

		const { errors } = await testServer.executeOperation({
			query: CreateUserDocument,
			variables: {
				username: name,
				email: "test@charlieisamazing.com",
				password: base64.encode("password")
			}
		});

		const working = await testServer.executeOperation({
			query: CreateUserDocument,
			variables: {
				username: name,
				email: "test@charlieisamazing.com",
				password: base64.encode("P@ssw0rd")
			}
		});
		if (errors) {
			expect(errors[0].message).toContain(VALID_PASSWORD);
		}
		if (working.data?.createUser) {
			serverContext.setAuthorization(working.data.createUser.token);
		}

		expect(working.data?.createUser).not.toBeNull();
		expect(working.data?.createUser.token).toEqual(
			serverContext.req.headers.authorization
		);
	});

	it("can add entry", async () => {
		const feedQuery = await testServer.executeOperation({
			query: AllPostsDocument
		});

		expect(feedQuery.data?.feed).toEqual([]);
		expect(feedQuery.errors).toBeUndefined();

		const { data } = await testServer.executeOperation({
			query: CreateEntryDocument,
			variables: {
				content: "> Hello!",
				title: "Something"
			}
		});

		const postQuery = await testServer.executeOperation({
			query: EditDocument,
			variables: {
				id: data?.createEntry.id
			}
		});

		expect(data?.createEntry.id).not.toBeUndefined();
		expect(postQuery.data?.entry.id).toEqual(data?.createEntry.id);
	});

	it("can edit entry", async () => {
		const feedQuery = await testServer.executeOperation({
			query: AllPostsDocument
		});

		const entry = feedQuery.data?.feed[0];

		const { data } = await testServer.executeOperation({
			query: UpdateEntryDocument,
			variables: {
				id: entry.id,
				title: "Updated Entry",
				status: entry.public,
				content: `> Hello Everyone!`
			}
		});

		expect(data?.updateEntry.title).toBe("Updated Entry");
		expect(data?.updateEntry.content).toBe(`> Hello Everyone!`);
	});

	it("can query feed", async () => {
		const { errors, data } = await testServer.executeOperation({
			query: AllPostsDocument
		});

		expect(data?.feed).toHaveLength(1);
		expect(errors).toBeUndefined();
	});

	it.todo("can remove post");
	it.todo("can reauthenticates");
});
