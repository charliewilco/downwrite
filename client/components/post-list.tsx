import * as React from "react";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import { IPost } from "downwrite";

interface IPostListProps {
  posts: any[];
  onDelete: ({ id }: Partial<IPost>) => void;
}

const PostList: React.FC<IPostListProps> = function(props) {
  const [isOpen, setOpen] = React.useState<boolean>(true);

  return (
    <>
      <header>
        <h1 className="ContainerTitle">Entries</h1>
        <LayoutControl layout={isOpen} layoutChange={setOpen} />
      </header>
      {isOpen ? (
        <ul className="Grid" data-testid="ENTRIES_GRIDVIEW">
          {props.posts.map((p, i) => (
            <li className="GridItem" key={i}>
              <Card {...p} onDelete={props.onDelete} />
            </li>
          ))}
        </ul>
      ) : (
        <ul data-testid="ENTRIES_LISTVIEW">
          {props.posts.map((p, i) => (
            <PostListItem key={i} {...p} onDelete={props.onDelete} />
          ))}
        </ul>
      )}
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        ul {
          width: 100%;
          list-style: inside none;
        }
        .Grid {
          list-style: none inside;
          display: flex;
          flex-wrap: wrap;
        }
        .GridItem {
          margin-bottom: 24px;
          width: 100%;
        }

        @media (min-width: 48rem) {
          .Grid {
            margin-left: -20px;
          }

          .GridItem {
            padding-left: 20px;
            width: 50%;
          }
        }

        @media (min-width: 57.75rem) {
          .GridItem {
            width: calc(100% / 3);
          }
        }

        @media (min-width: 75rem) {
          .GridItem {
            width: calc(100% / 4);
          }
        }

        @media (min-width: 112.5rem) {
          .GridItem {
            width: calc(100% / 5);
          }
        }

        @media (min-width: 150rem) {
          .GridItem {
            width: calc(100% / 6);
          }
        }

        @media (min-width: 187.5rem) {
          .GridItem {
            width: calc(100% / 7);
          }
        }
      `}</style>
    </>
  );
};

export default PostList;
