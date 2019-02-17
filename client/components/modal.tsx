import * as React from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import * as Reach from "@reach/dialog";
import { CloseIcon } from "./icons";
import * as DefaultStyles from "../utils/defaultStyles";

const fadein = keyframes`
  0% {
    transform: translate(0, 75%);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
`;

const DialogStyles = createGlobalStyle`
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

`;

const Overlay = styled(Reach.DialogOverlay)`
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
`;

const ModalContainer = styled(Reach.DialogContent)`
  animation: ${fadein} 0.45s;
  background: white;
  width: 100%;
  height: auto;
  position: relative;
  color: ${DefaultStyles.colors.text};
  display: flex;
  margin-left: auto;
  margin-right: auto;
  width: auto;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  border: 0px;
  background: none;
  appearance: none;
  display: block;
  margin: 0px;
  font-family: inherit;
`;

const ModalInnerContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`;

interface ModalProps {
  closeUIModal: () => void;
  children: React.ReactNode;
}

const UIModal: React.FC<ModalProps> = function(props) {
  return (
    <Overlay>
      <DialogStyles />
      <ModalContainer>
        <ModalCloseButton onClick={props.closeUIModal}>
          <CloseIcon className="Modal__close" />
        </ModalCloseButton>
        <ModalBody>
          <ModalInnerContainer>{props.children}</ModalInnerContainer>
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

export default UIModal;
