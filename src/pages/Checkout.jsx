import { useRef } from 'react'
import { useStore } from '../store'
import { validateTel } from '../utils'

export default function Checkout() {
  const { cTotal, sv, setCtx } = useStore(s => s)
  const total = cTotal()
  const nombreRef = useRef(), telRef = useRef(), emailRef = useRef(), notaRef = useRef()
  const errRef    = useRef()

  const go = () => {
    const n = nombreRef.current.value.trim()
    const t = telRef.current.value.trim()
    if (!n || !t) { alert('Nombre y teléfono son obligatorios'); return }
    if (!validateTel(t)) { errRef.current.style.display = 'block'; return }
    errRef.current.style.display = 'none'
    setCtx({ nombre: n, tel: t, email: emailRef.current.value.trim(), nota: notaRef.current.value.trim() })
    sv('pay')
  }

  return (
    <div className="scr">
      <h2>Tus datos</h2>
      <div className="card">
        <span className="lbl">Nombre completo *</span>
        <input ref={nombreRef} name="nombre" placeholder="Tu nombre completo" />
        <span className="lbl">WhatsApp *</span>
        <input ref={telRef} name="tel" type="tel" placeholder="+56 9 XXXX XXXX" />
        <div ref={errRef} style={{ color: '#A32D2D', fontSize: 11, marginTop: 2, display: 'none' }}>Número inválido</div>
        <span className="lbl">Correo (para confirmación)</span>
        <input ref={emailRef} name="email" type="email" placeholder="tu@correo.cl" />
        <span className="lbl">Comentarios</span>
        <textarea ref={notaRef} name="comentarios" rows={2} style={{ resize: 'none' }} placeholder="Alergias, preferencias..." />
      </div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Total</span>
        <span style={{ fontSize: 18, fontWeight: 500 }}>${total.toLocaleString('es-CL')}</span>
      </div>
      <button className="btn p w" onClick={go}>Continuar al pago</button>
    </div>
  )
}
