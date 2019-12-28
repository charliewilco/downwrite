import gql from "graphql-tag";

export const ALL_POSTS_QUERY = gql`
  query AllPosts {
    feed {
      title
      dateAdded
      id
      public
    }
  }
`;

export const EDIT_QUERY = gql`
  query Edit($id: ID!) {
    entry(id: $id) {
      title
      dateAdded
      content
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

export const UPDATE_ENTRY_MUTATION = gql`
  mutation UpdateEntry(
    $id: String
    $content: String
    $title: String
    $status: Boolean
  ) {
    updateEntry(id: $id, content: $content, title: $title, status: $status) {
      id
    }
  }
`;

export const CREATE_ENTRY_MUTATION = gql`
  mutation CreateEntry($content: String, $title: String) {
    createEntry(content: $content, title: $title) {
      id
    }
  }
`;

export const REMOVE_ENTRY_MUTATION = gql`
  mutation RemoveEntry($id: ID) {
    deleteEntry(id: $id) {
      title
    }
  }
`;
