import React from 'react'

export default function RoleSwitcher({ value, onChange }) {
  return (
    <div className="role-switcher">
      <button onClick={() => onChange('ADMIN')} className={`role-button ${value === 'ADMIN' ? 'active' : ''}`}>Admin</button>
      <button onClick={() => onChange('AGENT')} className={`role-button ${value === 'AGENT' ? 'active' : ''}`}>Agent</button>
    </div>
  )
}
