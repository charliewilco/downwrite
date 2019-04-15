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
          <h6 className="DeleteTitle">Delete Post</h6>
          <p className="DeleteEntryWarning">
            Are you sure you want to delete <b>{quotedTitle(props.title)}</b>?
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
