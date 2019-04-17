import * as React from "react";
import * as Reach from "@reach/dialog";
import { CloseIcon } from "./icons";

interface IModalProps {
  closeUIModal: () => void;
  children: React.ReactNode;
}

export default function UIModal(props: IModalProps) {
  return (
    <Reach.DialogOverlay className="Overlay">
      <Reach.DialogContent className="ModalContainer Wrapper Wrapper--sm">
        <button className="ModalCloseButton" onClick={props.closeUIModal}>
          <CloseIcon className="Modal__close" />
        </button>
        <div className="ModalBody">
          <div className="ModalContainerInner">{props.children}</div>
        </div>
      </Reach.DialogContent>
    </Reach.DialogOverlay>
  );
}
