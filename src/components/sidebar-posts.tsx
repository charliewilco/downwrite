import PostListItem from "./post-list-item";
import { IEntry } from "../utils/generated";

interface ISidebarPostProps {
  posts: Omit<IEntry, "author">[];
  onDelete(...args: unknown[]): void;
}

export default function SidebarPosts(props: ISidebarPostProps): JSX.Element {
  return (
    <div>
      <h6 style={{ fontSize: 12, marginBottom: 8 }}>Recent Entries</h6>
      {props.posts.slice(0, 2).map((p, i) => (
        <div style={{ marginBottom: 16 }} key={i}>
          <PostListItem
            title={p.title!}
            dateAdded={p.dateAdded!}
            public={p.public!}
            id={p.id!}
            onDelete={props.onDelete}
          />
        </div>
      ))}
    </div>
  );
}
