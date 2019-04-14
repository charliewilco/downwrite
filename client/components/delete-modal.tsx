import * as React from "react";
import Modal from "./modal";
import { Button, AltButton } from "./button";

const quotedTitle = (title: string) => `"${title}"`;

interface IDeleteModalProps {
  closeModal: () => void;
  title: string;
  onCancelDelete: () => void;
  onDelete: () => void;
}

export default function DeleteModal(props: IDeleteModalProps) {
  return (
    <Modal closeUIModal={props.closeModal}>
      <div className="DeleteEntry">
        <div className="DeleteEntryContents">
          <h6>Delete Post</h6>
          <p className="DeleteEntryWarning">
            Are you sure you want to delete{" "}
            <strong>{quotedTitle(props.title)}</strong>?
          </p>
        </div>
        <footer className="DeleteEntryTray">
          <AltButton onClick={props.onCancelDelete}>Cancel</AltButton>
          <Button onClick={props.onDelete}>Delete</Button>
        </footer>
      </div>
    </Modal>
  );
}
