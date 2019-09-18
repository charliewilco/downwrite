import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  scalar Date

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
    content: String
    author: Author
    dateAdded: Date
  }

  type User {
    username: String!
    email: String!
    password: String
    admin: Boolean
    posts: [Entry]
  }

  type Query {
    entry(id: ID): Entry
    feed: [Entry!]!
    preview(id: ID): Preview
  }

  type Mutation {
    createEntry(content: String, title: String): Entry
    deleteEntry(id: ID): Entry
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
