import { ResolverContext } from "./queries";

export interface IMutationCreateEntryVars {
  title: string;
  content: string;
  id?: string;
  status?: boolean;
}

export interface IMutationUserVars {
  email?: string;
  password: string;
  username: string;
}

export async function createPost(context: ResolverContext) {}

export async function updatePost(
  context: ResolverContext,
  id: string,
  body: IMutationCreateEntryVars
) {}

export async function removePost() {}

export async function authenticateUser() {}

export async function createUser() {}
