import { useMemo } from "react";
import { ILocalDraft } from "@reducers/local";

interface IDraftListProps {
  drafts: ILocalDraft[];
  onEdit(d: ILocalDraft): void;
  onRemove(d: ILocalDraft): void;
}

export default function DraftList(props: IDraftListProps): JSX.Element {
  const hasLength = useMemo<boolean>(() => props.drafts.length > 0, [props.drafts]);

  return (
    <details>
      <summary>Local Drafts</summary>

      {hasLength ? (
        <ul>
          {props.drafts.map((draft, i) => {
            return (
              <li key={draft.id || i}>
                <span>
                  {draft.title} | {draft.id}
                </span>
                <button
                  type="button"
                  onClick={() => props.onEdit(draft)}
                  className="mr-4">
                  Edit
                </button>
                <button type="button" onClick={() => props.onRemove(draft)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <span>No Drafts</span>
      )}
    </details>
  );
}
