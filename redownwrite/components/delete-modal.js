import React from 'react'
import styled from 'styled-components'
import Modal from './modal'
import Button from './button'
import Cancel from './cancel'

const DeleteTray = styled.div`
  display: flex;
  justify-content: flex-end;
`

const DeleteBody = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  max-width: 480px;
`

const DeleteTrayDivider = styled.hr`
  box-sizing: inherit;
  border: 0;
  height: 1px;
`

const Box = styled.div``

const DeleteWarning = styled.p`
  font-size: 16px;
`

export default ({ closeModal, title, onCancelDelete, onDelete }) => (
  <Modal closeUIModal={closeModal} sm>
    <Box>
      <DeleteBody>
        <DeleteWarning>
          Are you sure you want to delete <strong>"{title}"</strong>?
        </DeleteWarning>
      </DeleteBody>
      <DeleteTrayDivider />
      <DeleteTray>
        <Cancel onClick={onCancelDelete}>Cancel</Cancel>
        <Button onClick={onDelete}>Delete</Button>
      </DeleteTray>
    </Box>
  </Modal>
)
