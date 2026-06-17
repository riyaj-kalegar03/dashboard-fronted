import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../services/api'

const SUB_CATEGORIES = {
  ANSWER: ['PTP','PAID','PARTIALLY_PAID','PAY_LATER','REFUSE_TO_PAY'],
  NO_ANSWER: ['NO_ANSWER','DISCONNECTED','CALL_FORWARDING','SWITCH_OFF','NOT_REACHABLE'],
  OTHER: ['OTHER','OUT_OF_SERVICE','INVALID_NUMBER','NO_INCOMING']
}

export default function AddRemarkPopup({ customerId, customerName, loanNumber, onClose, onSuccess }) {
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [remark, setRemark] = useState('')
  const [subOptions, setSubOptions] = useState([])
  const [subDisabled, setSubDisabled] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!category) {
      setSubDisabled(true)
      setSubOptions([])
      setSubCategory('')
      return
    }
    const key = category
    const opts = SUB_CATEGORIES[key] || []
    setSubOptions(opts)
    setSubDisabled(false)
    setSubCategory('')
  }, [category])

  const validate = () => {
    if (!category) { toast.error('Category is required'); return false }
    if (!subCategory) { toast.error('Sub category is required'); return false }
    if (!remark.trim()) { toast.error('Remark is required'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/remarks', {
        customerId: Number(customerId),
        category,
        subCategory,
        remark
      })
      toast.success('Remark added successfully')
      onSuccess && onSuccess()
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add remark'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mini-popup" role="dialog" aria-modal="false">
      <div className="mini-popup-card">
        <div className="mini-popup-header">
          <h3 style={{margin:0}}>New Collection Remark</h3>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>

        <form className="mini-popup-body" onSubmit={handleSubmit}>
          <label className="input-label">
            <span>Customer Name</span>
            <input className="input" value={customerName || ''} readOnly />
          </label>

          <label className="input-label">
            <span>Loan Number</span>
            <input className="input" value={loanNumber || ''} readOnly />
          </label>

          <label className="input-label">
            <span>Category</span>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select</option>
              <option value="ANSWER">ANSWER</option>
              <option value="NO_ANSWER">NO_ANSWER</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>

          <label className="input-label">
            <span>Sub Category</span>
            <select className="input" value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} disabled={subDisabled} required>
              <option value="">Select</option>
              {subOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="input-label">
            <span>Remark</span>
            <textarea className="input" rows={4} value={remark} onChange={(e)=>setRemark(e.target.value)} required placeholder="Customer promised to pay on Monday." />
          </label>

          <div style={{display:'flex', justifyContent:'flex-end', marginTop:12}}>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Remark'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
