import { DialogContent, DialogOverlay } from "@reach/dialog";
import { Button, AltButton } from "./button";
import { FiX } from "react-icons/fi";

const quotedTitle = (title: string) => `"${title}"`;

interface IDeleteModalProps {
  closeModal: () => void;
  title: string;
  onCancelDelete: () => void;
  onDelete: () => void;
}

export function DeleteModal(props: IDeleteModalProps) {
  return (
    <DialogOverlay>
      <DialogContent>
        <button onClick={props.closeModal}>
          <FiX />
        </button>
        <div>
          <div>
            <h6>Delete Post</h6>
            <p>
              Are you sure you want to delete <b>{quotedTitle(props.title)}</b>?
            </p>
          </div>
          <footer>
            <AltButton onClick={props.onCancelDelete}>Cancel</AltButton>
            <Button onClick={props.onDelete}>Delete</Button>
          </footer>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}
