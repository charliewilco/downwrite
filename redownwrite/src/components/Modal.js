// @flow
import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import LockScroll from './LockScroll'
import Wrapper from './Wrapper'
import { CloseIcon } from './'

const fadein = keyframes`
  0% {
    transform: translate(0, 75%);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
`

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
`
const ModalContainer = styled(Wrapper)`
  animation: ${fadein} 0.45s;
  background: white;
  width: 100%;
  height: 50%;
  position: relative;
  color: var(--text);
  display: flex;
`

const ModalCloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  border: 0px;
  background: none;
  appearance: none;
  display: block;
  margin: 0px;
`

const ModalInnerContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`

type ModalProps = {
  closeUIModal: Function,
  children: React.Node,
  xs: boolean,
  sm: boolean
}

export default class extends React.Component<ModalProps, void> {
  static displayName = 'UIModal'

  render() {
    const { closeUIModal, children, sm, xs } = this.props
    return (
      <LockScroll>
        <Overlay>
          <ModalContainer sm={sm} xs={xs}>
            <ModalCloseButton onClick={closeUIModal}>
              <CloseIcon />
            </ModalCloseButton>
            <ModalBody>
              <ModalInnerContainer children={children} />
            </ModalBody>
          </ModalContainer>
        </Overlay>
      </LockScroll>
    )
  }
}
