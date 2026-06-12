import React, { useEffect, useRef, useState } from 'react'
import { User, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()
  const email = localStorage.getItem('email')
  const username = email ? email.split('@')[0] : ''
  const [fintechs, setFintechs] = useState([])
  const [selectedFintechId, setSelectedFintechId] = useState(localStorage.getItem('selectedFintechId'))
  const [selectedFintechName, setSelectedFintechName] = useState(localStorage.getItem('selectedFintechName'))
  const [fintechOpen, setFintechOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const fintechRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (fintechRef.current && !fintechRef.current.contains(event.target)) {
        setFintechOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const fetchFintechs = async () => {
      setLoading(true)
      setHasError(false)
      try {
        const response = await api.get('/call-center-fintech/fintechs')
        const list = Array.isArray(response.data) ? response.data : []
        setFintechs(list)

        if (list.length === 0) {
          setSelectedFintechId(null)
          setSelectedFintechName('No Fintech Assigned')
          localStorage.removeItem('selectedFintechId')
          localStorage.removeItem('selectedFintechName')
          return
        }

        const storedId = localStorage.getItem('selectedFintechId')
        const storedName = localStorage.getItem('selectedFintechName')
        if (storedId && storedName) {
          const match = list.find((item) => item.fintechId.toString() === storedId.toString())
          if (match) {
            setSelectedFintechId(storedId)
            setSelectedFintechName(storedName)
            return
          }
        }

        const first = list[0]
        setSelectedFintechId(first.fintechId.toString())
        setSelectedFintechName(first.fintechName)
        localStorage.setItem('selectedFintechId', first.fintechId)
        localStorage.setItem('selectedFintechName', first.fintechName)
      } catch (error) {
        console.log('[Navbar] Error fetching fintechs:', error.response?.status, error.message)
        setHasError(true)
        setFintechs([])
        setSelectedFintechName('No Fintech Assigned')
      } finally {
        setLoading(false)
      }
    }

    fetchFintechs()
  }, [])

  const selectFintech = (fintech) => {
    setSelectedFintechId(fintech.fintechId.toString())
    setSelectedFintechName(fintech.fintechName)
    localStorage.setItem('selectedFintechId', fintech.fintechId)
    localStorage.setItem('selectedFintechName', fintech.fintechName)
    setFintechOpen(false)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    localStorage.removeItem('selectedFintechId')
    localStorage.removeItem('selectedFintechName')
    toast.success('Logged out successfully.')
    navigate('/login')
  }

  const dropdownLabel = loading
    ? 'Loading fintechs...'
    : fintechs.length === 0
    ? 'No Fintech Assigned'
    : selectedFintechName || 'Select Fintech'

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left" ref={fintechRef}>
          <button
            type="button"
            className="dropdown-button"
            onClick={() => setFintechOpen((open) => !open)}
            disabled={fintechs.length === 0 && !loading}
          >
            <span>{dropdownLabel}</span>
            {fintechOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {fintechOpen && fintechs.length > 0 && (
            <div className="dropdown-list card">
              {fintechs.map((fintech) => (
                <button
                  key={fintech.mappingId}
                  type="button"
                  className={`dropdown-item ${fintech.fintechId.toString() === selectedFintechId ? 'active' : ''}`}
                  onClick={() => selectFintech(fintech)}
                >
                  {fintech.fintechName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-right" ref={profileRef}>
          <button type="button" className="profile-button" onClick={() => setProfileOpen((open) => !open)}>
            <User size={18} />
            <span>{username || 'User'}</span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="profile-dropdown card">
              <button type="button" className="dropdown-item" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
