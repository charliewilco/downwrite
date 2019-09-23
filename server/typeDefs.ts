import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  scalar Date

  # Models
  type Entry {
    id: ID
    title: String
    author: String
    content: String
    public: Boolean
    dateAdded: Date
    dateModified: Date
    excerpt: String
    user: User
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
    admin: Boolean
    posts: [Entry]
  }

  # Inputs

  input UserSettingsInput {
    username: String
    email: String
  }

  # Payload

  type CreateUserPayload {
    user: User
    token: String
  }

  # Root

  type Query {
    entry(id: ID): Entry
    feed: [Entry!]!
    preview(id: ID): Preview
  }

  type Mutation {
    createEntry(content: String, title: String): Entry
    deleteEntry(id: ID): Entry
    createUser(username: String!, password: String!): CreateUserPayload
    updateUserSettings(settings: UserSettingsInput!): User
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
