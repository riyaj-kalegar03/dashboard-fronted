import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import RoleSwitcher from '../components/RoleSwitcher'
import OTPButton from '../components/OTPButton'
import Input from '../components/Input'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { register, handleSubmit, watch, getValues } = useForm()
  const [role, setRole] = useState('AGENT')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const sendOtp = async () => {
    const email = getValues('email') || ''
    if (!email) {
      toast.error('Please enter email first.')
      return false
    }
    try {
      const res = await api.post('/auth/resend-otp', null, { params: { email } })
      toast.success(res.data || 'OTP sent to email')
      return true
    } catch (err) {
      const msg = err.response?.data || err.message || 'Failed to send OTP'
      toast.error(msg)
      return false
    }
  }

  const extractToken = (data) => {
    if (!data) return null
    if (typeof data === 'string') return data
    if (typeof data === 'object') {
      return (
        data.token || data.accessToken || data.jwt || data.data?.token || data.data?.accessToken || data.data?.jwt || null
      )
    }
    return null
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = { email: data.email, password: data.password }
      if (role === 'ADMIN') payload.otp = data.otp
      const res = await api.post('/auth/login', payload)
      const token = extractToken(res.data)?.toString().trim()
      console.log('[Login] Response data:', res.data)
      console.log('[Login] Extracted token:', token?.substring(0, 30) + '...')
      if (!token || token === 'null' || token === 'undefined') {
        throw new Error('Invalid login response')
      }
      localStorage.setItem('token', token)
      localStorage.setItem('email', data.email)
      localStorage.setItem('role', role === 'ADMIN' ? 'CALL_CENTER_ADMIN' : 'AGENT')
      console.log('[Login] Token saved to localStorage')
      navigate('/dashboard')
      toast.success('Logged in')
    } catch (err) {
      const msg = err.response?.data || err.message || 'Login failed'
      console.error('[Login] Error:', msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card card">
        <div className="auth-image">
          <div className="overlay">
            <div>
              <h2 style={{fontSize:22, fontWeight:600}}>Debt Recovery Dashboard</h2>
              <p style={{marginTop:8}}>Secure access for admins and agents.</p>
            </div>
          </div>
        </div>
        <div className="auth-form-wrap">
          <div className="form-container">
            <h1 className="welcome-headline">Welcome to My Debt Dashboard</h1>
            <div className="form-header">
              <span className="form-title">Sign in</span>
              <RoleSwitcher value={role} onChange={setRole} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{marginBottom:12}}>
                <Input label="Email" type="email" {...register('email', { required: true })} />
              </div>

              <div className={`otp-section ${role !== 'ADMIN' ? 'hidden' : ''}`} aria-hidden={role !== 'ADMIN'}>
                <label className="input-label">
                  <span>OTP</span>
                  <div className="otp-row" style={{marginTop:6}}>
                    <input className="input" type="text" inputMode="numeric" {...register('otp', { required: role === 'ADMIN' })} />
                    <OTPButton onClick={sendOtp} />
                  </div>
                </label>
              </div>

              <div style={{marginBottom:12}}>
                <label className="input-label">
                  <span>Password</span>
                  <div style={{position:'relative', marginTop:6}}>
                    <input type={show ? 'text' : 'password'} className="input" style={{paddingRight:40}} {...register('password', { required: true })} />
                    <button type="button" onClick={() => setShow((s) => !s)} style={{position:'absolute', right:8, top:8, border:'none', background:'transparent', cursor:'pointer'}}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              <div>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Logging in...' : 'Login'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
