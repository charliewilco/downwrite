import { DialogContent, DialogOverlay } from "@reach/dialog";
import { FiX } from "react-icons/fi";

interface IModalProps {
  closeUIModal: () => void;
}

const UIModal: React.FC<IModalProps> = (props) => {
  return (
    <DialogOverlay className="overflow-auto fixed z-50 top-0 bottom-0 flex justify-center flex-col items-center w-full p-2 ">
      <DialogContent className="w-full m-auto bg-white h-auto flex relative">
        <button
          className="absolute m-0 appearance-none p-2 right-0 top-0"
          onClick={props.closeUIModal}>
          <FiX className="" />
        </button>
        <div className="flex flex-col justify-center flex-1">
          <div className="m-0">{props.children}</div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
};

export default UIModal;
