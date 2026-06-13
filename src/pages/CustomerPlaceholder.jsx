import React from 'react'

export default function CustomerPlaceholder() {
  return (
    <div style={{ padding: '40px', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ background: '#ffffff', borderRadius: '18px', padding: '32px', boxShadow: '0 15px 40px rgba(15,23,42,0.08)' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Customer Detail</h2>
        <p style={{ marginTop: 12, color: '#475569', lineHeight: 1.6 }}>
          Customer details will be available in the next phase. For now, the dashboard home still contains the customer list.
        </p>
      </div>
    </div>
  )
}
