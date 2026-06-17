import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import WorkspaceModal from './WorkspaceModal'
import api from '../services/api'

export default function ExportRemarksModal({ isOpen, onClose }) {
  const selectedFintechId = localStorage.getItem('selectedFintechId')
  const selectedFintechName = localStorage.getItem('selectedFintechName') || ''
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState('')

  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const extractErrorMessage = async (error) => {
    const response = error.response
    if (response?.data instanceof Blob) {
      try {
        const text = await response.data.text()
        const json = JSON.parse(text)
        return json.message || text || 'Export failed'
      } catch {
        return error.message || 'Export failed'
      }
    }
    return response?.data?.message || response?.data || error.message || 'Export failed'
  }

  const handleExport = async () => {
    if (!selectedFintechId) {
      const errorText = 'Please select a fintech first.'
      toast.error(errorText)
      setMessage(errorText)
      return
    }

    setMessage('')
    setIsExporting(true)
    try {
      const response = await api.get('/remarks/export', {
        params: { fintechId: selectedFintechId },
        responseType: 'blob',
      })

      const blob = response.data
      if (!blob || blob.size === 0) {
        const noDataText = 'No remarks available to export for selected fintech.'
        setMessage(noDataText)
        toast.error(noDataText)
        return
      }

      const safeName = selectedFintechName ? selectedFintechName.replace(/\s+/g, '_') : 'remarks'
      const filename = `remarks_${safeName}.xlsx`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Remarks exported successfully.')
    } catch (error) {
      const errorText = await extractErrorMessage(error)
      setMessage(errorText)
      toast.error(errorText)
    } finally {
      setIsExporting(false)
    }
  }

  const modalContent = (
    <div className="export-remarks-modal">
      <div className="fintech-info-card">
        <p className="section-label">Selected Fintech</p>
        <p className="fintech-name">{selectedFintechName || 'Not selected'}</p>
      </div>

      <div className="info-box">
        <p>
          You are about to export all remarks belonging to the currently selected fintech.
          Only remarks from the selected fintech will be included in the Excel file.
        </p>
      </div>

      <div className="export-summary-card">
        <div className="summary-row">
          <span>Fintech:</span>
          <strong>{selectedFintechName || '-'}</strong>
        </div>
        <div className="summary-row">
          <span>Fintech Id:</span>
          <strong>{selectedFintechId || '-'}</strong>
        </div>
        <div className="summary-row">
          <span>Date:</span>
          <strong>{formattedDate}</strong>
        </div>
      </div>

      {message && (
        <div className="export-message">
          {message}
        </div>
      )}

      <button
        type="button"
        className="btn-primary export-button"
        onClick={handleExport}
        disabled={isExporting || !selectedFintechId}
      >
        {isExporting ? 'Exporting...' : 'Export Remarks Excel'}
      </button>
    </div>
  )

  return <WorkspaceModal isOpen={isOpen} onClose={onClose} title="Export Remarks" children={modalContent} />
}
