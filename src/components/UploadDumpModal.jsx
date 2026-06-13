import React, { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import WorkspaceModal from './WorkspaceModal'

export default function UploadDumpModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const fileInputRef = useRef(null)

  const selectedFintechId = localStorage.getItem('selectedFintechId')
  const selectedFintechName = localStorage.getItem('selectedFintechName')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file)
      } else {
        toast.error('Please select an Excel file (.xlsx or .xls)')
      }
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file)
      } else {
        toast.error('Please select an Excel file (.xlsx or .xls)')
      }
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }
    if (!selectedFintechId) {
      toast.error('Please select a fintech first')
      return
    }
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('fintechId', selectedFintechId)
      const response = await api.post('/customers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadResult({
        successCount: response.data.successCount,
        failedCount: response.data.failedCount,
        errors: response.data.errors || [],
      })
      if (response.data.failedCount === 0) {
        toast.success('Upload completed successfully!')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadAnother = () => {
    setSelectedFile(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleModalClose = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const hasFintech = !!selectedFintechId && selectedFintechId !== 'null'

  const modalContent = (
    <div>
      {!hasFintech ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <p>Please select a fintech first.</p>
        </div>
      ) : !uploadResult ? (
        <>
          <div className="fintech-info">
            <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '13px' }}>Current Fintech:</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{selectedFintechName}</p>
          </div>

          <div className="instruction-card">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>IMPORTANT</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#0f172a', lineHeight: 1.5 }}>
                  Before uploading Excel, ensure these column headers exist exactly with the same spelling and casing:
                </p>
                <div style={{ margin: '12px 0', padding: '10px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', color: '#1f2937' }}>
                  customerName | phone | loanNumber
                </div>
                <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#0f172a', lineHeight: 1.5 }}>
                  If your Excel contains different header names such as <strong>name</strong>, <strong>mobile</strong>, <strong>loanid</strong>, <strong>loan_no</strong>, <strong>customer_phone</strong>, etc., please rename them before uploading.
                </p>
                <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                  These three columns are mandatory. All other columns can have any name.
                </p>
              </div>
            </div>
          </div>

          <div className={`file-upload-zone ${isDragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
              <Upload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
              <p style={{ margin: '0 0 8px 0', color: '#0f172a', fontWeight: 500 }}>Drag & Drop Excel File Here</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>OR</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button className="btn-browse" onClick={handleBrowseClick}>
              Browse File
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>

          {selectedFile && (
            <div className="selected-file-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Upload size={18} style={{ color: '#3b82f6' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 500, color: '#0f172a', fontSize: '14px' }}>{selectedFile.name}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            </div>
          )}

          <button className="btn-upload" onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              'Upload Customers'
            )}
          </button>
        </>
      ) : (
        <>
          <div className="upload-summary">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Upload Summary</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}>Successfully Uploaded</p>
                <p className="stat-count success">{uploadResult.successCount}</p>
              </div>
              <div className="summary-stat">
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}>Failed Records</p>
                <p className="stat-count error">{uploadResult.failedCount}</p>
              </div>
            </div>
            {uploadResult.failedCount === 0 && (
              <div className="success-alert">
                <CheckCircle size={20} style={{ color: '#10b981' }} />
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#065f46' }}>Upload completed successfully.</p>
                  <p style={{ margin: 0, color: '#047857', fontSize: '13px' }}>All customers imported.</p>
                </div>
              </div>
            )}
          </div>

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="error-section">
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Upload Errors</h3>
              <div className="error-list">
                {uploadResult.errors.map((error, idx) => (
                  <div key={idx} className="error-item">
                    <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '13px' }}>{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn-upload-another" onClick={handleUploadAnother}>
            Upload Another File
          </button>
        </>
      )}
    </div>
  )

  return <WorkspaceModal isOpen={isOpen} onClose={handleModalClose} title="Upload Customer Dump" children={modalContent} />
}
