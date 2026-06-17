import React, { useState } from 'react'

export default function CalculatorPopup({ onClose }) {
  const [expr, setExpr] = useState('')

  const press = (v) => setExpr((s) => s + v)
  const clear = () => setExpr('')
  const back = () => setExpr((s) => s.slice(0, -1))
  const calc = () => {
    try {
      // simple evaluator
      // eslint-disable-next-line no-new-func
      const result = Function(`return (${expr})`)()
      setExpr(String(result))
    } catch (e) {
      setExpr('Error')
    }
  }

  const btn = (v) => (
    <button className="calc-btn" type="button" onClick={() => press(v)}>{v}</button>
  )

  return (
    <div className="mini-popup small" role="dialog" aria-modal="false">
      <div className="mini-popup-card">
        <div className="mini-popup-header">
          <h3 style={{margin:0}}>Calculator</h3>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>
        <div style={{padding:12}}>
          <input className="input" value={expr} readOnly style={{marginBottom:8}} />
          <div className="calc-grid">
            {btn('7')}{btn('8')}{btn('9')}{btn('/')}
            {btn('4')}{btn('5')}{btn('6')}{btn('*')}
            {btn('1')}{btn('2')}{btn('3')}{btn('-')}
            {btn('0')}{btn('.')}
            <button className="calc-btn wide" type="button" onClick={calc}>=</button>
            <button className="calc-btn" type="button" onClick={() => press('+')}>+</button>
          </div>
          <div style={{display:'flex', gap:8, marginTop:10}}>
            <button className="sidebar-button" type="button" onClick={clear}>Clear</button>
            <button className="sidebar-button" type="button" onClick={back}>Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}
