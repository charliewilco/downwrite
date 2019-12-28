import { gql } from "apollo-server-micro";

export const typeDefs = gql`
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
    admin: Boolean
    posts: [Entry]
  }

  # Inputs

  input UserSettingsInput {
    username: String
    email: String
  }

  # Payload

  type AuthUserPayload {
    user: User
    token: String
  }

  # Root

  type Query {
    """
    Markdown document
    """
    entry(id: ID): Entry
    """
    List of Markdown documents
    """
    feed: [Entry!]!
    """
    Public preview of Markdown document
    """
    preview(id: ID): Preview
    """
    User Settings
    """
    settings: User
  }

  type Mutation {
    createEntry(content: String, title: String): Entry
    updateEntry(id: String, content: String, title: String, status: Boolean): Entry
    deleteEntry(id: ID): Entry
    createUser(username: String!, email: String!, password: String!): AuthUserPayload
    authenticateUser(username: String!, password: String!): AuthUserPayload
    updateUserSettings(settings: UserSettingsInput!): User
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
