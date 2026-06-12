import React, { useEffect, useState } from 'react'

export default function OTPButton({ onClick, disabled: parentDisabled }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let t
    if (count > 0) {
      t = setTimeout(() => setCount((c) => c - 1), 1000)
    }
    return () => clearTimeout(t)
  }, [count])

  const handleClick = async () => {
    const result = await onClick()
    if (result === true) setCount(30)
  }

  return (
    <button type="button" onClick={handleClick} disabled={parentDisabled || count > 0} className="otp-button">
      {count > 0 ? `Resend in ${count}s` : 'Send OTP'}
    </button>
  )
}
