import React, { forwardRef } from 'react'

const Input = forwardRef(({ label, ...props }, ref) => (
  <label className="input-label">
    <span>{label}</span>
    <input className="input" ref={ref} {...props} />
  </label>
))

Input.displayName = 'Input'
export default Input
