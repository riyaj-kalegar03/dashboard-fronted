import React from 'react'
import WorkspaceModal from './WorkspaceModal'

export default function ExportRemarksModal({ isOpen, onClose }) {
  const modalContent = (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
      <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>Coming in next phase.</p>
      <p style={{ fontSize: '13px', color: '#94a3b8' }}>Export functionality will be implemented soon.</p>
    </div>
  )

  return <WorkspaceModal isOpen={isOpen} onClose={onClose} title="Export Remarks" children={modalContent} />
}
