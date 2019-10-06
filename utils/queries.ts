import gql from "graphql-tag";

export const ALL_POSTS_QUERY = gql`
  query {
    feed {
      title
      dateAdded
      id
      public
    }
  }
`;

export const PREVIEW_QUERY = gql`
  query Preview($id: ID!) {
    preview(id: $id) {
      title
      dateAdded
      id
      content
      author {
        username
      }
    }
  }
`;
