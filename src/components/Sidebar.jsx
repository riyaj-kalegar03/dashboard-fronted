import React, { useState } from 'react'
import { Menu, LayoutDashboard, Users, Upload, FileText, Settings, ChevronRight } from 'lucide-react'

export default function Sidebar({ onMenuItemClick, activeItem }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: 'dashboard' },
    { id: 'customers', label: 'Customers', icon: Users, action: 'customers' },
    { id: 'upload', label: 'Upload Dump', icon: Upload, action: 'upload' },
    { id: 'export', label: 'Export Remarks', icon: FileText, action: 'export' },
    { id: 'manage', label: 'Manage Agents', icon: Settings, action: 'manage' },
  ]

  const handleMenuClick = (action) => {
    onMenuItemClick(action)
  }

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <Menu size={20} />
      </button>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`sidebar-item ${activeItem === item.action ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.action)}
              title={!isExpanded ? item.label : ''}
            >
              <Icon size={20} className="sidebar-icon" />
              {isExpanded && (
                <>
                  <span className="sidebar-label">{item.label}</span>
                  <ChevronRight size={16} className="sidebar-chevron" />
                </>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
