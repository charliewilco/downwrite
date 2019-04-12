import * as React from "react";
import * as Reach from "@reach/dialog";
import { CloseIcon } from "./icons";
import * as DefaultStyles from "../utils/defaultStyles";

interface IModalProps {
  closeUIModal: () => void;
  children: React.ReactNode;
}

export default function UIModal(props: IModalProps) {
  return (
    <Reach.DialogOverlay className="Overlay">
      <Reach.DialogContent className="ModalContainer">
        <button className="ModalCloseButton" onClick={props.closeUIModal}>
          <CloseIcon className="Modal__close" />
        </button>
        <div className="ModalBody">
          <div className="ModalContainerInner">{props.children}</div>
        </div>
        <style jsx global>{`
          :root {
            --reach-dialog: 1;
          }

          [data-reach-dialog-overlay] {
            overflow: auto;
          }

          [data-reach-dialog-content] {
            width: 50vw;
            margin: 10vh auto;
            outline: none;
          }

          @keyframes FADE_IN {
            0% {
              transform: translate(0, 75%);
              opacity: 0;
            }

            100% {
              transform: translate(0, 0);
              opacity: 1;
            }
          }

          .Overlay {
            position: fixed;
            top: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            width: 100%;
            background-color: rgba(21, 69, 93, 0.925);
            background-blend-mode: multiply;
          }

          .ModalCloseButton {
            position: absolute;
            right: 16px;
            top: 16px;
            border: 0px;
            background: none;
            appearance: none;
            display: block;
            margin: 0px;
            font-family: inherit;
          }

          .ModalBody {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
          }

          .ModalContainer {
            animation: FADE_IN 0.45s;
            background: white;
            width: 100%;
            height: auto;
            position: relative;
            color: ${DefaultStyles.colors.text};
            display: flex;
            margin-left: auto;
            margin-right: auto;
            width: auto;
          }

          .ModalContainerInner {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
          }
        `}</style>
      </Reach.DialogContent>
    </Reach.DialogOverlay>
  );
}
