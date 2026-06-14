import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UploadDumpModal from '../components/UploadDumpModal'
import ExportRemarksModal from '../components/ExportRemarksModal'
import ManageAgentsModal from '../components/ManageAgentsModal'
import ManageCustomersModal from '../components/ManageCustomersModal'
import ConfirmModal from '../components/ConfirmModal'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { auth } = useContext(AuthContext)
  const navigate = useNavigate()
  const isAdmin = auth?.role === 'CALL_CENTER_ADMIN'

  const [selectedFintechId, setSelectedFintechId] = useState(localStorage.getItem('selectedFintechId'))
  const [selectedFintechName, setSelectedFintechName] = useState(localStorage.getItem('selectedFintechName') || '')
  const [customers, setCustomers] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageInput, setPageInput] = useState('')
  const [pageError, setPageError] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeSidebarItem, setActiveSidebarItem] = useState('customers')

  const loadCustomers = async (page = 0, search = activeSearch, size = pageSize) => {
    if (!selectedFintechId) {
      setCustomers([])
      setTotalItems(0)
      setTotalPages(0)
      setCurrentPage(0)
      return
    }

    setLoading(true)
    try {
      const baseParams = { fintechId: selectedFintechId, page, size }
      const endpoint = search ? '/customers/search' : '/customers'
      const params = search ? { ...baseParams, search } : baseParams
      const response = await api.get(endpoint, { params })
      const data = response.data || {}

      setCustomers(Array.isArray(data.customers) ? data.customers : [])
      setCurrentPage(typeof data.currentPage === 'number' ? data.currentPage : 0)
      setTotalItems(typeof data.totalItems === 'number' ? data.totalItems : 0)
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 0)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load customers'
      toast.error(message)
      setCustomers([])
      setTotalItems(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleFintechChanged = () => {
      const id = localStorage.getItem('selectedFintechId')
      const name = localStorage.getItem('selectedFintechName') || ''
      setSelectedFintechId(id)
      setSelectedFintechName(name)
      setCurrentPage(0)
      setSearchQuery('')
      setActiveSearch('')
    }

    window.addEventListener('fintechChanged', handleFintechChanged)
    handleFintechChanged()
    return () => window.removeEventListener('fintechChanged', handleFintechChanged)
  }, [])

  useEffect(() => {
    loadCustomers(currentPage, activeSearch, pageSize)
  }, [selectedFintechId, currentPage, activeSearch, pageSize])

  useEffect(() => {
    if (searchQuery.trim() === '' && activeSearch !== '') {
      setActiveSearch('')
      setCurrentPage(0)
    }
  }, [searchQuery, activeSearch])

  const handleSearch = (event) => {
    event.preventDefault()
    const trimmed = searchQuery.trim()
    setActiveSearch(trimmed)
    setCurrentPage(0)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return
    setPageInput('')
    setPageError('')
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value)
    setPageSize(newSize)
    setCurrentPage(0)
    setPageInput('')
    setPageError('')
  }

  const handleGoToPage = (event) => {
    event.preventDefault()
    const requestedPage = Number(pageInput)
    const maxPage = Math.max(totalPages, 1)

    if (!requestedPage || requestedPage < 1 || requestedPage > maxPage) {
      setPageError('Invalid page number.')
      return
    }

    setPageError('')
    setCurrentPage(requestedPage - 1)
    setPageInput('')
  }

  const handleDeleteClick = (customer) => {
    setDeleteTarget(customer)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const customerId = deleteTarget.id || deleteTarget.customerId
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
      loadCustomers(currentPage, activeSearch)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete customer'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMenuItemClick = (action) => {
    if (action === 'upload' || action === 'export' || action === 'manage' || action === 'manageCustomers') {
      setActiveModal(activeModal === action ? null : action)
      return
    }
    if (action === 'dashboard' || action === 'customers') {
      setActiveSidebarItem(action)
      setActiveModal(null)
    }
  }

  const renderEmptyState = () => {
    if (loading) return null
    if (!selectedFintechId) {
      return <div className="empty-state">Please select a fintech first.</div>
    }
    if (activeSearch) {
      return <div className="empty-state">No matching customers found.</div>
    }
    return <div className="empty-state">No customers found for selected fintech.</div>
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        {isAdmin && <Sidebar onMenuItemClick={handleMenuItemClick} activeItem={activeSidebarItem} isAdmin={isAdmin} />}

        <main className={`dashboard-main ${isAdmin ? 'with-sidebar' : 'full-width'}`}>
          <div className="customer-page-header card">
            <div>
              <h1>Customer List</h1>
              <div className="fintech-badge-header">
                <span>Currently Viewing:</span>
                <strong>{selectedFintechName || 'No fintech selected'}</strong>
              </div>
            </div>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by customer name, phone or loan number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedFintechId}
              />
              <button type="submit" disabled={!selectedFintechId || searchQuery.trim() === ''}>
                Search
              </button>
            </form>
          </div>

          <div className="customer-table-wrap card">
            {loading ? (
              <div className="table-skeleton">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="skeleton-row" />
                ))}
              </div>
            ) : customers.length > 0 ? (
              <>
                <div className="table-header-row">
                  <div className="table-summary">
                    Total Customers: {totalItems.toLocaleString()}
                  </div>
                  <div className="table-controls">
                    <label className="rows-per-page">
                      Rows per page
                      <select value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Phone</th>
                        <th>Loan Number</th>
                        {/* {isAdmin && <th>Delete</th>} */}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.customerId || customer.id}>
                          <td>{customer.customerName || '-'}</td>
                          <td>
                            {customer.phone ? (
                              <a href={`tel:${customer.phone}`} className="phone-link">
                                {customer.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            {customer.loanNumber ? (
                              <button
                                type="button"
                                className="loan-link"
                                onClick={() => navigate(`/customer/${customer.id || customer.customerId}`)}
                              >
                                {customer.loanNumber}
                              </button>
                            ) : (
                              '-'
                            )}
                          </td>
                          {/* {isAdmin && (
                            <td className="action-cell">
                              <button className="btn-danger-outline" onClick={() => handleDeleteClick(customer)}>
                                Delete
                              </button>
                            </td>
                          )} */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-row">
                  <div className="pagination-actions">
                    <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 0 || loading}>
                      Previous
                    </button>
                    <span>
                      Page {currentPage + 1} of {Math.max(totalPages, 1)}
                    </span>
                    <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage + 1 >= totalPages || loading}>
                      Next
                    </button>
                  </div>
                  <form className="goto-form" onSubmit={handleGoToPage}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Page"
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                      Go
                    </button>
                  </form>
                </div>
                {pageError && <div className="page-error">{pageError}</div>}
              </>
            ) : (
              renderEmptyState()
            )}
          </div>
        </main>
      </div>

      <UploadDumpModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} />
      <ExportRemarksModal isOpen={activeModal === 'export'} onClose={() => setActiveModal(null)} />
      <ManageAgentsModal isOpen={activeModal === 'manage'} onClose={() => setActiveModal(null)} />
      <ManageCustomersModal
        isOpen={activeModal === 'manageCustomers'}
        fintechId={selectedFintechId}
        fintechName={selectedFintechName}
        onClose={(refresh) => {
          setActiveModal(null)
          if (refresh) {
            loadCustomers(currentPage, activeSearch)
          }
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Customer?"
        message="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  )
}
