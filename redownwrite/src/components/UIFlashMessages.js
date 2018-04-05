import React from 'react'
import styled from 'styled-components'
import { CloseIcon } from './'

const UIFlashContainer = styled.div`
  display: flex;
  border-left: 5px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  z-index: 900;
  max-width: ${props => props.width}px;
  left: 0px;
  right: 0px;
  background: var(--color-6);
  color: var(--text);
  position: fixed;
  top: 20px;
  margin: auto;
  text-align: ${props => props.centered && 'center'};
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
`

const Stretch = styled.div`
  flex: 1;
`

const CloseButton = styled.button`
  appearance: none;
  border: 0px;
  color: inherit;
`

const UIFlash = ({ width = 512, onClose, content, type }) => (
  <UIFlashContainer width={width} centered={!onClose}>
    <Stretch>
      {type && `${type.length > 0 && type.toUpperCase()}:`} {content}
    </Stretch>
    {onClose && (
      <CloseButton onClick={onClose}>
        <CloseIcon fill="currentColor" />
      </CloseButton>
    )}
  </UIFlashContainer>
)

export default UIFlash

// TODO: This needs a few tests and these functions need to be documented

//
/*
	Should this component wrap every route?
	Will need these props available at the top level of every Route for sure
	will need a type of Flash Message
	<UIFlashContainer>
		<App
			message='' String
			revealMessage={fn()}
			dismissMessage={fn()}
		/>
	</UIFlash>
*/
