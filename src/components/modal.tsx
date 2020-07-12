import { DialogContent, DialogOverlay } from "@reach/dialog";
import { FiX } from "react-icons/fi";

interface IModalProps extends React.PropsWithChildren<{}> {
  closeUIModal: () => void;
}

export default function UIModal(props: IModalProps) {
  return (
    <DialogOverlay className="overflow-auto fixed z-50 top-0 bottom-0 flex justify-center flex-col items-center w-full p-2 ">
      <DialogContent className="w-full m-auto bg-white h-auto flex relative">
        <button
          className="absolute m-0 appearance-none p-4"
          onClick={props.closeUIModal}>
          <FiX className="" />
        </button>
        <div className="flex flex-col justify-center flex-1">
          <div className="m-0">{props.children}</div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}
