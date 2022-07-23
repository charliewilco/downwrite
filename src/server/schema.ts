import { gql } from "graphql-tag";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Query } from "./queries";
import { Mutation } from "./mutations";
import { ResolverContext } from "./context";

const typeDefs = gql`
  scalar Date

  # Models

  type Entry {
    id: ID
    title: String
    author: Author
    content: String
    public: Boolean
    dateAdded: Date
    dateModified: Date
    excerpt: String
    user: String
  }

  type Author {
    username: String
    gradient: [String]
  }

  type Preview {
    title: String
    id: ID
    content: String
    author: Author
    dateAdded: Date
  }

  type User {
    username: String!
    email: String!
    id: ID!
    admin: Boolean
  }

  # Inputs

  input UserSettingsInput {
    username: String
    email: String
  }

  # Payload

  type AuthUserPayload {
    token: String
  }

  type UsageDetails {
    entryCount: Int!
    privateEntries: Int!
    publicEntries: Int!
  }

  type Me {
    details: User
    token: String
    usage: UsageDetails!
  }

  # Root

  type Query {
    """
    Markdown document
    """
    entry(id: ID!): Entry
    """
    List of Markdown documents
    """
    feed: [Entry!]!
    """
    Public preview of Markdown document
    """
    preview(id: ID!): Preview
    """
    User Settings
    """
    settings: User
    me: Me
  }

  type Mutation {
    createEntry(content: String, title: String): Entry
    updateEntry(
      id: String!
      content: String!
      title: String!
      status: Boolean!
    ): Entry
    deleteEntry(id: ID!): Entry
    createUser(username: String!, email: String!, password: String!): AuthUserPayload
    authenticateUser(username: String!, password: String!): AuthUserPayload
    updateUserSettings(settings: UserSettingsInput!): User
    updatePassword(currentPassword: String!, newPassword: String!): AuthUserPayload
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export const schema = makeExecutableSchema<ResolverContext>({
  typeDefs,
  resolvers: {
    Query,
    Mutation
  }
});
