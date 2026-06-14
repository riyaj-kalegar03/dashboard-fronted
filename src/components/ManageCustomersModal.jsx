import React, { useEffect, useRef, useState } from 'react'
import { Search, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import WorkspaceModal from './WorkspaceModal'
import ConfirmModal from './ConfirmModal'

export default function ManageCustomersModal({ isOpen, onClose, fintechId, fintechName, onBulkDeleteSuccess }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [otp, setOtp] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [bulkError, setBulkError] = useState('')
  const otpInputRef = useRef(null)
  const bulkErrorRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setSearchQuery('')
    setSearchResults([])
    setSearchError('')
    setDeleteTarget(null)
    setIsDeleting(false)
    setOtpSent(false)
    setOtpCountdown(0)
    setOtp('')
    setIsSendingOtp(false)
    setIsVerifying(false)
    setBulkError('')
  }, [isOpen, fintechId])

  useEffect(() => {
    if (!isOpen) return
    if (!fintechId || searchQuery.trim() === '') {
      setSearchResults([])
      setSearchError('')
      return
    }

    const timer = setTimeout(() => {
      fetchSearch(searchQuery.trim())
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, fintechId, isOpen])

  useEffect(() => {
    if (!otpSent || otpCountdown <= 0) return

    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [otpSent, otpCountdown])

  useEffect(() => {
    if (bulkError && bulkErrorRef.current) {
      setTimeout(() => {
        bulkErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
    }
  }, [bulkError])

  const fetchSearch = async (query) => {
    setLoadingSearch(true)
    setSearchError('')
    try {
      const response = await api.get('/customers/search', {
        params: {
          fintechId,
          search: query,
          page: 0,
          size: 20,
        },
      })
      const data = response.data || {}
      const results = Array.isArray(data.customers)
        ? data.customers
        : Array.isArray(data)
        ? data
        : []
      setSearchResults(results)
    } catch (error) {
      setSearchError(error.response?.data?.message || error.message || 'Search failed')
      setSearchResults([])
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleDeleteClick = (customer) => {
    setDeleteTarget(customer)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const customerId = deleteTarget.customerId || deleteTarget.id || deleteTarget._id
    if (!customerId) {
      toast.error('Unable to determine customer ID for deletion.')
      setDeleteTarget(null)
      return
    }
    setIsDeleting(true)
    try {
      await api.delete(`/customers/${customerId}`)
      toast.success('Customer deleted successfully.')
      setDeleteTarget(null)
      if (searchQuery.trim()) {
        fetchSearch(searchQuery.trim())
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete customer'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendOtp = async () => {
    if (!fintechId) {
      setBulkError('Please select a fintech first.')
      return
    }
    setIsSendingOtp(true)
    setBulkError('')
    try {
      await api.post('/customers/bulk-delete/send-otp', null, {
        params: { fintechId },
      })
      toast.success('OTP sent successfully.')
      setOtpSent(true)
      setOtpCountdown(60)
      setTimeout(() => {
        otpInputRef.current?.focus()
        otpInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || error.message || 'Failed to send OTP'
      setBulkError(message)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyAndDelete = async () => {
    if (!otp.trim()) {
      setBulkError('Enter OTP to continue.')
      return
    }
    if (!fintechId) {
      setBulkError('Please select a fintech first.')
      return
    }

    setIsVerifying(true)
    setBulkError('')
    try {
      await api.post('/customers/bulk-delete/verify', null, {
        params: {
          otp: otp.trim(),
          fintechId,
        },
      })
      toast.success('Customers deleted successfully.')
      if (onBulkDeleteSuccess) {
        onBulkDeleteSuccess()
      }
      onClose(true)
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || error.message || 'Bulk delete failed'
      setBulkError(message)
    } finally {
      setIsVerifying(false)
    }
  }

  const resetBulkDelete = () => {
    setOtpSent(false)
    setOtp('')
    setOtpCountdown(0)
    setBulkError('')
  }

  const modalContent = (
    <div>
      <div className="fintech-info">
        <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '13px' }}>Current Fintech:</p>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{fintechName || 'No fintech selected'}</p>
      </div>

      <div className="modal-section">
        <div className="section-title">Search and delete individual customer</div>
        <div className="search-field">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Customer ID, Phone or Loan Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!fintechId}
          />
        </div>
        {searchError && <div className="error-text">{searchError}</div>}

        {loadingSearch ? (
          <div className="section-note">Searching...</div>
        ) : searchQuery.trim() === '' ? (
          <div className="section-note">Type at least one character to search.</div>
        ) : searchResults.length === 0 ? (
          <div className="section-note">No customers found.</div>
        ) : (
          <div className="table-responsive modal-table-responsive">
            <table className="customer-table modal-customer-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Loan Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((customer) => {
                  const customerIdValue = customer.customerId || customer.id || customer._id
                  return (
                    <tr key={customerIdValue || customer.phone || customer.loanNumber || Math.random()}>
                      <td>{customerIdValue || '-'}</td>
                      <td>{customer.customerName || '-'}</td>
                      <td>{customer.phone || '-'}</td>
                      <td>{customer.loanNumber || '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-danger-outline"
                          onClick={() => handleDeleteClick(customer)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="danger-zone-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={20} style={{ color: '#b91c1c' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#991b1b' }}>Delete Entire Fintech Data</h3>
          </div>
        </div>
        <p style={{ margin: '0 0 16px 0', color: '#581c1c', fontSize: '14px', lineHeight: 1.6 }}>
          This action will permanently delete all customers belonging to the currently selected fintech.
          This action cannot be undone.
        </p>

        <div className="bulk-otp-row">
          <button
            type="button"
            className="btn-browse"
            onClick={handleSendOtp}
            disabled={!fintechId || isSendingOtp || otpCountdown > 0}
          >
            {otpCountdown > 0 ? `Resend OTP in ${otpCountdown}s` : 'Send OTP'}
          </button>
        </div>

        {otpSent && (
          <div className="otp-section">
            <div className="section-note" style={{ marginBottom: '12px' }}>
              OTP sent. Please enter the code below.
            </div>
            <div className="otp-row">
              <div style={{ flex: 1 }}>
                <label className="otp-label" htmlFor="bulk-otp-input">Enter OTP</label>
                <input
                  ref={otpInputRef}
                  id="bulk-otp-input"
                  className="otp-input"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="otp-actions">
                <button type="button" className="btn-upload-another" onClick={resetBulkDelete} disabled={isVerifying}>
                  Cancel
                </button>
                <button type="button" className="btn-upload" onClick={handleVerifyAndDelete} disabled={isVerifying}>
                  {isVerifying ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <div className="bulk-confirmation-card">
              <p style={{ margin: '0 0 8px 0', color: '#0f172a', fontWeight: 600 }}>You are about to permanently delete all customer records for {fintechName || 'the selected fintech'}. This action cannot be undone.</p>
              
            </div>
            {bulkError && <div ref={bulkErrorRef} className="page-error">{bulkError}</div>}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this customer?"
        message="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  )

  return (
    <WorkspaceModal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Customer Management"
      children={modalContent}
    />
  )
}
