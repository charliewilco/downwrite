import { DialogContent, DialogOverlay } from "@reach/dialog";
import { CloseIcon } from "./icons";

interface IModalProps extends React.PropsWithChildren<{}> {
  closeUIModal: () => void;
}

export default function UIModal(props: IModalProps) {
  return (
    <DialogOverlay className="Overlay">
      <DialogContent className="ModalContainer Wrapper Wrapper--sm">
        <button className="ModalCloseButton" onClick={props.closeUIModal}>
          <CloseIcon className="Modal__close" />
        </button>
        <div className="ModalBody">
          <div className="ModalContainerInner">{props.children}</div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}
