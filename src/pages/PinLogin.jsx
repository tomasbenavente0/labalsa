import { useRef } from 'react'
import { useStore } from '../store'

export default function PinLogin({ tipo }) {
  const pinRef = useRef()
  const errRef = useRef()
  const { db, sv } = useStore(s => s)

  const check = () => {
    const v = pinRef.current?.value || ''
    if (tipo === 'admin') {
      if (v === (db.config.adminPin || 'Balsa3322')) {
        useStore.setState({ adminOk: true })
      } else {
        errRef.current.textContent = 'PIN incorrecto'
      }
    } else {
      const p = db.prestadores.find(x => x.pin === v && x.activo)
      if (p) {
        useStore.setState({ presId: p.id, panelTab: 'disponibilidad', ctx: {} })
      } else {
        errRef.current.textContent = 'PIN incorrecto'
      }
    }
  }

  return (
    <div className="scr">
      <div className="pinwrap">
        <i className="ti ti-lock" style={{ fontSize: 30, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 14 }} />
        <h2>{tipo === 'admin' ? 'Administrador' : 'Panel de prestador'}</h2>
        <p style={{ marginBottom: 14, color: 'var(--color-text-secondary)' }}>Ingresa tu PIN</p>
        <input type="password" ref={pinRef} placeholder="PIN" autoComplete="off"
          onKeyDown={e => e.key === 'Enter' && check()} />
        <button className="btn p w" onClick={check}>Entrar</button>
        <div ref={errRef} style={{ color: '#A32D2D', fontSize: 12, marginTop: 6 }} />
      </div>
    </div>
  )
}
