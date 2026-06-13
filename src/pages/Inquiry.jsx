import { useRef, useState } from 'react'
import { useStore } from '../store'
import { fdd, validateTel, uid } from '../utils'
import emailjs from '@emailjs/browser'
import { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAIL_TOMAS } from '../services/email'

export default function Inquiry() {
  const { ctx, sv, gp, db, setDB } = useStore(s => s)
  const p    = gp(ctx.consultaPresId)
  const fecha = ctx.consultaFecha
  const [done, setDone] = useState(false)
  const [code, setCode] = useState('')
  const [tel,  setTel]  = useState('')
  const nombreRef = useRef(), telRef = useRef(), emailRef = useRef(), msgRef = useRef()

  const send = async () => {
    const n = nombreRef.current.value.trim()
    const t = telRef.current.value.trim()
    if (!n || !t) { alert('Nombre y teléfono son obligatorios'); return }
    if (!validateTel(t)) { alert('Número inválido'); return }
    const id = 'CON-' + Date.now().toString(36).toUpperCase()
    const c  = {
      id, presId: ctx.consultaPresId, presNombre: p?.nombre || '',
      fecha, nombre: n, tel: t,
      email: emailRef.current.value.trim() || '',
      msg: msgRef.current.value.trim() || '',
      estado: 'pendiente', createdAt: new Date().toISOString(),
    }
    setDB(old => ({ ...old, consultas: [...(old.consultas || []), c] }))
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        codigo: id, cliente_nombre: n, cliente_tel: t, cliente_email: c.email || '—',
        fecha: fdd(fecha), noches: 1, prestador: c.presNombre,
        resumen: 'Consulta de disponibilidad — sin reserva confirmada',
        total: '—', pago: 'Pendiente confirmación', nota: c.msg || '—', to_email: EMAIL_TOMAS,
      }).catch(() => {})
    }
    setCode(id); setTel(t); setDone(true)
  }

  if (!p) return null

  if (done) return (
    <div className="scr" style={{ textAlign: 'center', padding: '24px 0' }}>
      <i className="ti ti-clock" style={{ fontSize: 44, color: '#633806' }} />
      <h2 style={{ margin: '12px 0 6px' }}>Consulta enviada</h2>
      <p>Te contactaremos al <b>{tel}</b>.</p>
      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-tertiary)' }}>Código: {code}</p>
      <button className="btn p w" style={{ maxWidth: 200, display: 'block', margin: '16px auto' }} onClick={() => sv('browse')}>Volver</button>
    </div>
  )

  return (
    <div className="scr">
      <button className="btn sm" onClick={() => sv('browse')} style={{ marginBottom: 10 }}><i className="ti ti-arrow-left" /> Volver</button>
      <div className="alert alert-info">
        <i className="ti ti-clock" /> <b>Esta fecha no está confirmada.</b> Envía una consulta y el dueño te responderá.
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Consulta de disponibilidad</h3>
        <p style={{ marginBottom: 8 }}>Fecha: <b>{fdd(fecha)}</b> · <b>{p.nombre}</b></p>
        <span className="lbl">Tu nombre *</span><input ref={nombreRef} name="nombre" placeholder="Nombre completo" />
        <span className="lbl">WhatsApp *</span><input ref={telRef} name="tel" type="tel" placeholder="+56 9 XXXX XXXX" />
        <span className="lbl">Correo</span><input ref={emailRef} name="email" type="email" placeholder="tu@correo.cl" />
        <span className="lbl">Mensaje</span><textarea ref={msgRef} rows={2} style={{ resize: 'none' }} placeholder="¿Algún detalle?" />
        <button className="btn p w" onClick={send}><i className="ti ti-send" /> Enviar consulta</button>
      </div>
    </div>
  )
}
