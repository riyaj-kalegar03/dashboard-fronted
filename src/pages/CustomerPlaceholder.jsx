import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ChevronLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'
import FloatingActionSidebar from '../components/FloatingActionSidebar'
import ErrorBoundary from '../components/ErrorBoundary'
import api from '../services/api'

export default function CustomerPlaceholder() {
  const params = useParams()
  const { customerId } = params
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)

  // Debug logging
  console.log('Route Params:', params)
  console.log('Customer ID:', customerId)

  const [customerDetails, setCustomerDetails] = useState(null)
  const [remarks, setRemarks] = useState([])
  const [loadingCustomer, setLoadingCustomer] = useState(true)
  const [loadingRemarks, setLoadingRemarks] = useState(false)
  const [errorCustomer, setErrorCustomer] = useState('')
  const [errorRemarks, setErrorRemarks] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const selectedFintechId = localStorage.getItem('selectedFintechId')

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) {
        console.error('Customer ID missing from route')
        setErrorCustomer('Invalid customer selected. Missing customer ID.')
        setLoadingCustomer(false)
        return
      }

      if (!selectedFintechId) {
        console.error('Fintech ID missing from localStorage')
        setErrorCustomer('Fintech ID not found. Please select a fintech first.')
        setLoadingCustomer(false)
        return
      }

      try {
        console.log(`Fetching customer details: /customers/${customerId}?fintechId=${selectedFintechId}`)
        const response = await api.get(`/customers/${customerId}`, {
          params: { fintechId: selectedFintechId },
        })
        setCustomerDetails(response.data)
        setErrorCustomer('')
      } catch (err) {
        const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to load customer details'
        console.error('Customer fetch error:', message)
        setErrorCustomer(message)
        toast.error(message)
      } finally {
        setLoadingCustomer(false)
      }
    }

    fetchCustomerDetails()
  }, [customerId, selectedFintechId])

  const fetchRemarks = async (page = 0, size = pageSize) => {
    if (!customerId) return
    setLoadingRemarks(true)
    try {
      const response = await api.get(`/remarks/customer/${customerId}`, { params: { page, size } })
      setRemarks(response.data.remarks || [])
      setCurrentPage(response.data.currentPage || page)
      setTotalPages(response.data.totalPages || 0)
      setTotalItems(response.data.totalItems || 0)
      setErrorRemarks('')
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to load remarks'
      console.error('Remarks fetch error:', message)
      setErrorRemarks(message)
    } finally {
      setLoadingRemarks(false)
    }
  }

  useEffect(() => { fetchRemarks(currentPage, pageSize) }, [customerId, currentPage, pageSize])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = date.toLocaleString('en-US', { month: 'short' })
      const year = date.getFullYear()
      const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return `${day} ${month} ${year} ${time}`
    } catch (e) {
      return dateString
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(0)
  }

  return (
    <div className="customer-detail-page">
      <Navbar />
      <ErrorBoundary>
      <main className="customer-detail-container">
        {/* Back Button */}
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Customer Details Card */}
        {loadingCustomer ? (
          <div className="skeleton-card">
            <div className="skeleton-line" style={{ width: '60%', height: '28px', marginBottom: '16px' }} />
            <div className="skeleton-line" style={{ width: '80%', height: '20px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '70%', height: '20px' }} />
          </div>
        ) : errorCustomer ? (
          <div className="card error-card">
            <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>{errorCustomer}</p>
          </div>
        ) : customerDetails ? (
          <div className="card customer-profile-card">
            <div className="profile-header">
              <h1 className="profile-name">{customerDetails.customerName || '-'}</h1>
            </div>

            <div className="unified-profile-grid">
              {/* Loan Number */}
              <div className="profile-row">
                <span className="profile-label">Loan Number</span>
                <span className="loan-badge">{customerDetails.loanNumber || '-'}</span>
              </div>

              {/* Phone */}
              <div className="profile-row">
                <span className="profile-label">Phone</span>
                {customerDetails.phone ? (
                  <a href={`tel:${customerDetails.phone}`} className="phone-link">
                    {customerDetails.phone}
                  </a>
                ) : (
                  <span className="profile-value">-</span>
                )}
              </div>

              {/* Call Center */}
              <div className="profile-row">
                <span className="profile-label">Call Center</span>
                <span className="profile-value">{customerDetails.callCenterId || '-'}</span>
              </div>

              {/* Fintech */}
              <div className="profile-row">
                <span className="profile-label">Fintech</span>
                <span className="profile-value">{customerDetails.fintechId || '-'}</span>
              </div>

              {/* Dynamic Fields */}
              {customerDetails.dynamicFields &&
                Object.entries(customerDetails.dynamicFields).map(([key, value]) => (
                  <div key={key} className="profile-row">
                    <span className="profile-label">{key}</span>
                    <span className="profile-value">{value || '-'}</span>
                  </div>
                ))}
            </div>
          </div>
        ) : null}

        {/* Remarks Section */}
        <div className="card remarks-card">
          <h2 className="section-title">Customer Remarks History</h2>

          {errorRemarks && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>{errorRemarks}</p>
            </div>
          )}

          {loadingRemarks ? (
            <div style={{ paddingTop: '20px' }}>
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="skeleton-row" />
              ))}
            </div>
          ) : remarks.length === 0 ? (
            <div style={{ paddingTop: '20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                No remarks available for this customer.
              </p>
            </div>
          ) : (
            <>
              {/* Remarks Table */}
              <div className="table-responsive" style={{ marginTop: '16px' }}>
                <table className="remarks-table">
                  <thead>
                    <tr>
                      <th>Created At</th>
                      <th>Loan Number</th>
                      <th>Fintech</th>
                      <th>Operator Name</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remarks.map((remark, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(remark.createdAt)}</td>
                        <td>{remark.loanNumber || '-'}</td>
                        <td>{remark.fintech || '-'}</td>
                        <td>{remark.createdBy || '-'}</td>
                        <td>{remark.category || '-'}</td>
                        <td>{remark.subCategory || '-'}</td>
                        <td>{remark.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination-container" style={{ marginTop: '20px' }}>
                <div className="pagination-controls">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 0 || loadingRemarks}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage + 1} of {Math.max(totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage + 1 >= totalPages || loadingRemarks}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>

                <div className="rows-per-page-container">
                  <label className="rows-per-page-label">
                    Rows per page
                    <select value={pageSize} onChange={handlePageSizeChange} disabled={loadingRemarks}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Floating action sidebar (only on this page) */}
        <FloatingActionSidebar
          customerId={customerId}
          customerDetails={customerDetails}
          refreshRemarks={() => fetchRemarks(0, pageSize)}
          canAddRemark={auth?.role === 'CALL_CENTER_ADMIN' || auth?.role === 'AGENT'}
        />
      </main>
      </ErrorBoundary>
    </div>
  )
}
