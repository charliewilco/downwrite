import * as React from "react";
import { ILocalDraft } from "../hooks/local-draft";

interface IDraftListProps {
  drafts: ILocalDraft[];
  onRemove(d: ILocalDraft): void;
}

export default function DraftList(props: IDraftListProps): JSX.Element {
  return props.drafts.length > 0 ? (
    <ul>
      {props.drafts.map((draft, i) => {
        return (
          <li key={draft.id || i}>
            <span>{draft.title} </span>
            <button onClick={() => console.log(draft)}>Edit</button>
            <button onClick={() => props.onRemove(draft)}>Remove</button>
          </li>
        );
      })}
    </ul>
  ) : null;
}
