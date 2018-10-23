import * as React from "react";
import styled, { keyframes } from "styled-components";
import LockScroll from "./lock-scroll";
import { CloseIcon } from "./icons";
import { colors } from "../utils/defaultStyles";

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

const Overlay = styled.div`
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

const ModalContainer = styled.div`
  animation: ${fadein} 0.45s;
  background: white;
  width: 100%;
  height: 50%;
  position: relative;
  color: ${colors.text};
  display: flex;
  margin-left: auto;
  margin-right: auto;
  max-width: 768px;
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

export default class UIModal extends React.Component<ModalProps, any> {
  static displayName = "UIModal";

  render() {
    const { closeUIModal, children } = this.props;
    return (
      <LockScroll>
        <Overlay>
          <ModalContainer>
            <ModalCloseButton onClick={closeUIModal}>
              <CloseIcon className="Modal__close" />
            </ModalCloseButton>
            <ModalBody>
              <ModalInnerContainer>{children}</ModalInnerContainer>
            </ModalBody>
          </ModalContainer>
        </Overlay>
      </LockScroll>
    );
  }
}
