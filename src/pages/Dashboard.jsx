import React from 'react'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="card content-card">
          <h2 style={{fontSize:18, fontWeight:600}}>Dashboard</h2>
          <p style={{color:'#475569', marginTop:8}}>Welcome to the Debt Recovery Dashboard. More modules will be added in Phase 2.</p>
        </div>
      </main>
    </div>
  )
}
