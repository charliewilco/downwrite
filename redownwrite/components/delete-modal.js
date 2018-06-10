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

export default ({ closeModal, title, onCancelDelete, onDelete }) => (
  <Modal closeUIModal={closeModal} sm>
    <div>
      <DeleteBody>
        <p className="h5">
          Are you sure you want to delete <strong>"{title}"</strong>?
        </p>
      </DeleteBody>
      <hr />
      <DeleteTray>
        <Cancel onClick={onCancelDelete}>Cancel</Cancel>
        <Button onClick={onDelete}>Delete</Button>
      </DeleteTray>
    </div>
  </Modal>
)
