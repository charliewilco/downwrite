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
      <div className="bg-onyx-900 pt-4 px-2 pb-0">
        <div className="mb-4 p-4">
          <h6 className="font-black text-xl">Delete Post</h6>
          <p className="my-4 mx-0 text-base">
            Are you sure you want to delete <b>{quotedTitle(props.title)}</b>?
          </p>
        </div>
        <footer className="border-t flex justify-end py-4 px-0">
          <AltButton onClick={props.onCancelDelete}>Cancel</AltButton>
          <Button className="ml-8" onClick={props.onDelete}>
            Delete
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
