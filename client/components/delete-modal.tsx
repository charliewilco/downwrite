import * as React from "react";
import Modal from "./modal";
import { Button, AltButton } from "./button";
import * as DefaultStyles from "../utils/defaultStyles";

const quotedTitle = (title: string) => `"${title}"`;

interface IDeleteModalProps {
  closeModal: () => void;
  title: string;
  onCancelDelete: () => void;
  onDelete: () => void;
}

const DeleteModal: React.FC<IDeleteModalProps> = props => (
  <Modal closeUIModal={props.closeModal}>
    <div className="box">
      <div className="contents">
        <h6>Delete Post</h6>
        <p className="warning">
          Are you sure you want to delete <strong>{quotedTitle(props.title)}</strong>
          ?
        </p>
      </div>
      <div className="delete-tray">
        <AltButton onClick={props.onCancelDelete}>Cancel</AltButton>
        <Button onClick={props.onDelete}>Delete</Button>
      </div>
    </div>
    <style jsx>{`
      .box {
        padding: 24px 8px 0;
      }

      .contents {
        margin-bottom: 16px;
        padding: 16px;
        max-width: 480px;
      }

      .delete-tray {
        display: flex;
        justify-content: flex-end;
        padding: 16px 0;
        font-family: ${DefaultStyles.fonts.sans};
      }

      .warning {
        margin: 16px 0;
        font-size: 16px;
      }
    `}</style>
  </Modal>
);

export default DeleteModal;
