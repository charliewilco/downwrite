import * as React from "react";
import styled from "styled-components";
import Modal from "./modal";
import Button, { AltButton } from "./button";
import * as DefaultStyles from "../utils/defaultStyles";

const DeleteTray = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  font-family: ${DefaultStyles.fonts.sans};
`;

const DeleteBody = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  max-width: 480px;
`;

const Box = styled.div`
  padding: 24px 8px 0;
`;

const DeleteWarning = styled.p`
  margin: 16px 0;
  font-size: 16px;
`;

const quotedTitle = (title: string) => `"${title}"`;

interface IDeleteModalProps {
  closeModal: () => void;
  title: string;
  onCancelDelete: () => void;
  onDelete: () => void;
}

const DeleteModal: React.FC<IDeleteModalProps> = props => (
  <Modal closeUIModal={props.closeModal}>
    <Box>
      <DeleteBody>
        <h6>Delete Post</h6>
        <DeleteWarning>
          Are you sure you want to delete <strong>{quotedTitle(props.title)}</strong>
          ?
        </DeleteWarning>
      </DeleteBody>
      <DeleteTray>
        <AltButton onClick={props.onCancelDelete}>Cancel</AltButton>
        <Button onClick={props.onDelete}>Delete</Button>
      </DeleteTray>
    </Box>
  </Modal>
);

export default DeleteModal;
