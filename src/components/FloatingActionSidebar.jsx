import React, { useState } from 'react'
import AddRemarkPopup from './AddRemarkPopup'
import CalculatorPopup from './CalculatorPopup'

export default function FloatingActionSidebar({ customerId, customerDetails, refreshRemarks, canAddRemark }) {
  const [openPopup, setOpenPopup] = useState(null) // 'remark' | 'calc' | null

  const handleOpenRemark = () => setOpenPopup((s) => (s === 'remark' ? null : 'remark'))
  const handleOpenCalc = () => setOpenPopup((s) => (s === 'calc' ? null : 'calc'))

  const closePopups = () => setOpenPopup(null)

  return (
    <div>
      <div className="floating-sidebar" role="toolbar" aria-orientation="vertical">
        {canAddRemark && (
          <button title="Add Remark" className="fab-icon" onClick={() => { if (openPopup === 'calc') setOpenPopup('remark'); else handleOpenRemark() }}>
            ✏️
          </button>
        )}

        <button title="Calculator" className="fab-icon" onClick={() => { if (openPopup === 'remark') setOpenPopup('calc'); else handleOpenCalc() }}>
          🧮
        </button>
      </div>

      {openPopup === 'remark' && (
        <AddRemarkPopup
          customerId={customerId}
          customerName={customerDetails?.customerName}
          loanNumber={customerDetails?.loanNumber}
          onClose={closePopups}
          onSuccess={() => { closePopups(); refreshRemarks && refreshRemarks() }}
        />
      )}

      {openPopup === 'calc' && (
        <CalculatorPopup onClose={closePopups} />
      )}
    </div>
  )
}
